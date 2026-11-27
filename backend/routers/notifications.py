from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, desc
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, Notification, Submission
from auth import get_current_user
from services.service_funcs import create_dashboard_notif_msg

router = APIRouter(prefix = '/api/notifications', tags = ['Notifications'])

@router.get('/')
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')

    stmt = (
        select(Notification)
        .where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False
        )
    )
    notifications = db.execute(stmt).scalars().all()
    notif_list = []

    actor_ids = {n.actor_id for n in notifications if n.actor_id}
    actor_map = {}
    if actor_ids:
        actors = db.execute(select(User.id, User.username).where(User.id.in_(actor_ids))).all()
        actor_map = {u.id: u.username for u in actors}

    for notif in notifications:
        msg = create_dashboard_notif_msg(notification = notif, actor_map = actor_map)
        if msg:
            notif_list.append(msg)
    return notif_list

@router.get('/admin')
def get_admin_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user or not current_user.is_admin:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')

    pendingStmt = (
        select(Submission)
        .where(Submission.status == 'pending')
    )
    pending = db.execute(pendingStmt).scalars().all()

    return len(pending)

@router.get('/dashboard/feed')
def get_feed_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fourteen_days_ago = datetime.now(timezone.utc) - timedelta(days = 14)
    if not current_user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')

    notifications = db.execute(
        select(Notification)
        .where(
            Notification.recipient_id == current_user.id,
            Notification.created_at >= fourteen_days_ago
        )
        .order_by(Notification.created_at.desc())
        .limit(15)
    ).scalars().all()

    actor_ids = {n.actor_id for n in notifications if n.actor_id}
    actor_map = {}
    if actor_ids:
        actors = db.execute(select(User.id, User.username).where(User.id.in_(actor_ids))).all()
        actor_map = {u.id: u.username for u in actors}

    feed = []
    for notif in notifications:
        msg = create_dashboard_notif_msg(notification = notif, actor_map = actor_map)
        if msg:
            feed.append(msg)

    followed = [u.id for u in current_user.following]
    if followed:
        activity_timestamp = func.coalesce(Submission.updated_at, Submission.created_at)
        followed_subs = db.execute(
            select(Submission)
            .where(
                Submission.user_id.in_(followed),
                Submission.status == 'approved',
                Submission.is_active == True,
                activity_timestamp >= fourteen_days_ago
            )
            .options(joinedload(Submission.author))
            .order_by(activity_timestamp.desc())
            .limit(15)
        ).scalars().unique().all()
        for sub in followed_subs:
            action = 'updated' if sub.updated_at else 'created'
            feed.append({
                'type': 'following_style',
                'actor': sub.author.username,
                'message': f'{sub.author.username} {action} a style:',
                'title': sub.title,
                'is_read': True,
                'date': sub.updated_at or sub.created_at
            })
    
    return {'success': True, 'feed': feed[:15]}

@router.patch('/read-all')
def set_notifications_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')

    stmt = (
        select(Notification)
        .where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False
        )
    )
    notifications = db.execute(stmt).scalars().all()
    try:
        for notif in notifications:
            notif.is_read == True

        db.commit()
        return{'success': True, 'message': f'All {len(notifications)} unread notifications set to read.'}
    except Exception as e:
        raise Exception(str(e))
