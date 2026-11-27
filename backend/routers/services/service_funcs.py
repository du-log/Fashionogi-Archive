from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Notification, User, Title, UserTitle

# Using this as a standalone helper
def create_notification(db: Session, recipient_id: int, type: str, actor_id: int | None = None, submission_id: int | None = None, submission_title: str | None = None, message: str | None = None):
    new_notification = Notification(
        recipient_id = recipient_id,
        type = type,
        actor_id = actor_id,
        submission_id = submission_id,
        submission_title = submission_title,
        message = message
    )

    db.add(new_notification)
    db.commit()

    return new_notification

def create_dashboard_notif_msg(notification: Notification, actor_map: dict[int, str]) -> dict | None:
    if notification.type == 'follow':
        follower = actor_map.get(notification.actor_id)
        if not follower:
            return None
        return {'message': f'{follower} is now following you!', 'type': notification.type, 'date': notification.created_at}

    if notification.type == 'title_unlock':
        return {'message': f'You unlocked a new title: {notification.message}', 'type': notification.type, 'date': notification.created_at}

    if notification.type == 'submission_approved':
        return {'message': f'Your style, {notification.submission_title}, has been approved.', 'type': notification.type, 'sub_id': notification.submission_id, 'date': notification.created_at}

    if notification.type == 'submission_rejected':
        return {'message': f'Your style, {notification.submission_title}, was rejected.', 'type': notification.type, 'sub_id': notification.submission_id, 'date': notification.created_at, 'detail': notification.message}

    return None

# This is essentially a copy of the title unlocking inside the users router file, just for use with /me to unlock titles immediately if requirements were fulfilled
def sync_user_titles(current_user: User, db: Session) -> list[Title]:
    approved_subs = [s for s in current_user.submissions if s.is_active and (s.status == 'approved' or s.was_approved)]
    stats = {
        'styles': len(approved_subs),
        'favorites': sum(len(s.favorited_by) for s in approved_subs),
        'views': sum(s.views or 0 for s in approved_subs),
        'followers': len(current_user.followers),
        'following': len(current_user.following)
    }
    
    owned_ids = {
        row.title_id for row in db.execute(
            select(UserTitle).where(UserTitle.user_id == current_user.id)
        ).scalars().all()
    }
    all_titles = db.execute(select(Title).order_by(Title.id)).scalars().all()
    
    new_unlocks = []
    for t in all_titles:
        if t.stat_type == 'special' or t.id in owned_ids:
            continue
        reqs = t.requirements or {}
        if reqs and all(stats.get(stat_key, 0) >= req_val for stat_key, req_val in reqs.items()):
            db.add(UserTitle(user_id = current_user.id, title_id = t.id))
            owned_ids.add(t.id)
            new_unlocks.append(t)
        
    if new_unlocks:
        db.commit()

    return new_unlocks