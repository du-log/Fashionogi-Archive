from fastapi import APIRouter

import os
import shutil
import uuid
import json
import boto3

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from botocore.config import Config

from fastapi import File, UploadFile, Form, Depends, HTTPException, Query, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, desc
from sqlalchemy.sql import func

from database import get_db, engine, Base
import models, auth

router = APIRouter(prefix = '/api/users', tags = ['Users'])

R2_BUCKET_NAME = os.environ.get('R2_BUCKET_NAME')
R2_PUBLIC_URL = os.environ.get('R2_PUBLIC_URL')
s3_client = boto3.client(
    's3',
    endpoint_url = os.environ.get('R2_ENDPOINT_URL'),
    aws_access_key_id = os.environ.get('R2_ACCESS_KEY'),
    aws_secret_access_key = os.environ.get('R2_SECRET_ACCESS'),
    config = Config(signature_version = 's3v4'),
    region_name = 'auto'
)

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    server: Optional[str] = None
    guild: Optional[str] = None
    in_game_name: Optional[str] = None
    main_race: Optional[str] = None
    main_gender: Optional[str] = None
    discord_username: Optional[str] = None
    twitter_link: Optional[str] = None
    twitch_link: Optional[str] = None
    youtube_link: Optional[str] = None

class UserProfileResponse(UserProfileUpdate):
    id: int
    joined: datetime
    avatar_id: Optional[str] = None

    class Config:
        from_attributes: True

@router.get('/me')
def get_user_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == current_user.username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')
    user.last_active = func.now()
    return { 'id': current_user.id, 'username': current_user.username, 'is_admin': current_user.is_admin, 'avatar_id': f'{R2_PUBLIC_URL}/avatars/{current_user.avatar_id.hex}.webp' or None }

@router.post('/me/avatar')
def update_avatar(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == current_user.username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')
    
    if file.content_type != 'image/webp':
        raise HTTPException(status_code = 400, detail = 'Invalid image format.')
    
    old_avatar = user.avatar_id
    if old_avatar:
        try:
            s3_client.delete_object(
                Bucket = R2_BUCKET_NAME,
                Key = f'avatars/{old_avatar.hex}.webp'
            )
        except Exception:
            pass
    
    new_uuid = uuid.uuid4()
    r2_object_key = f'avatars/{new_uuid.hex}.webp'

    s3_client.upload_fileobj(
        file.file,
        R2_BUCKET_NAME,
        r2_object_key,
        ExtraArgs = {'ContentType': 'image/webp'}
    )

    user.avatar_id = new_uuid
    db.commit()

    return {
        'success': True,
        'message': 'Successfully updated user avatar.',
        'avatar_id': str(new_uuid)
    }

@router.get('/profiles/{username}', response_model = UserProfileResponse)
def get_public_profile(username: str, db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 404, detail = 'User not found')

    if not user.profile:
        return {
            'id': user.id,
            'bio': None,
            'server': None,
            'guild': None,
            'in_game_name': None,
            'main_race': None,
            'main_gender': None,
            'discord_username': None,
            'twitter_link': None,
            'twitch_link': None,
            'youtube_link': None
        }

    return user.profile

@router.get('/profiles/{username}/nameplate', response_model = UserProfileResponse)
def get_public_profile_nameplate(username: str, db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 404, detail = 'User not found')

    if not user.profile:
        return {
            'id': user.id,
            'bio': None,
            'server': None,
            'guild': None,
            'in_game_name': None,
            'main_race': None,
            'main_gender': None,
            'discord_username': None,
            'twitter_link': None,
            'twitch_link': None,
            'youtube_link': None
        }

    return user.profile

@router.get('/profiles/{username}/styles')
def get_user_styles(username: str, db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 404, detail = 'User not found')
    stmtOne = (
        select(models.Submission)
        .where(
            models.Submission.status == 'approved',
            models.Submission.user_id == user.id
        )
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .order_by(models.Submission.created_at.desc())
        .limit(10)
    )

    latest = db.execute(stmtOne).scalars().unique().all()

    resultsL = []
    for sub in latest:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        resultsL.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images]
        })

    stmtTwo = (
        select(models.Submission)
        .outerjoin(models.user_favorites, models.Submission.id == models.user_favorites.c.submission_id)
        .group_by(models.Submission.id)
        .order_by(desc(func.count(models.user_favorites.c.user_id)))
        .where(
            models.Submission.status == 'approved',
            models.Submission.user_id == user.id
        )
        .options(
            selectinload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .limit(3)
    )

    submissions = db.execute(stmtTwo).scalars().unique().all()

    resultsT = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        favorites_count = len(sub.favorited_by)
        resultsT.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'favorites': favorites_count
        })
    
    stmtThree = (select(models.Submission.title, models.Submission.id).where(models.Submission.status == 'approved', models.Submission.user_id == user.id))
    total = db.execute(stmtThree).scalars().unique().all()
    
    return {'latest': resultsL, 'top': resultsT, 'total': len(total)}

@router.patch('/profiles/me/update', response_model = UserProfileResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        profile = models.UserProfile(id = current_user.id)
        db.add(profile)

    update_fields = profile_data.model_dump(exclude_unset = True)
    for key, value in update_fields.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)

    return profile

@router.get('/username/check/{username}')
def check_username_availability(username: str, db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.username == username)
    )
    user = db.execute(stmt).scalars().first()
    if user:
        return {'success': False, 'message': f'{username} is already taken.'}
    
    return {'success': True, 'message': f'{username} is available!'}

@router.patch('/username/update/{username}')
def update_username(username: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.username == username)
    )
    user = db.execute(stmt).scalars().first()
    if user:
        raise HTTPException(status_code = 400, detail = 'Requested username already taken. Possible attempt to bypass through intrusive action.')

    user_me = current_user
    if not user_me:
        raise HTTPException(status_code = 403, detail = 'Unauthorized action.')

    user_me.username = username
    db.commit()

    return {'message': 'Username successfully changed.', 'new_username': current_user.username}

@router.get('/email/check/{email}')
def check_email_availability(email: str, db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.email == email)
    )
    user = db.execute(stmt).scalars().first()
    if user:
        return {'success': False, 'message': f'{email} is already in use.'}
    
    return {'success': True, 'message': f'{email} is not in use.'}

@router.get('/dashboard/queue')
def get_my_submissions(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission.id, models.Submission.title, models.Submission.status, models.Submission.created_at)
        .where(models.Submission.user_id == current_user.id)
        .order_by(models.Submission.created_at.desc())
    )

    results = db.execute(stmt).mappings().all()

    return [dict(row) for row in results]

@router.get('/dashboard/favorites')
def get_my_favorites(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.favorited_by.any(id = current_user.id))
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .order_by(models.Submission.created_at.desc())
    )

    favorited = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in favorited:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)

        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images]
        })

    return results

@router.get('/password/verify/{password}')
def verify_password(password: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.id == current_user.id)).scalars().first()
    if not user:
        raise HTTPException(status_code = 403, detail = 'Unauthorized.')
    
    if not auth.verify_pw(password, user.hashed_password):
        raise HTTPException(status_code = 400, detail = 'Passwords do not match.')

    return {'success': True,'message': 'Password successfully verified.'}

@router.patch('/password/update/{password}')
def update_password(password: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.id == current_user.id)).scalars().first()
    if not user:
        raise HTTPException(status_code = 403, detail = 'Unauthorized.')
    
    hashed = auth.get_pw_hash(password)
    user.hashed_password = hashed

    db.commit()

    return {'success': True, 'message': f'User {user.username}, ID {user.id} successfully changed password.'}

@router.post('/{user_id}/follow')
def toggle_follow(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code = 400, detail = 'You cannot follow yourself.')

    stmt = (
        select(models.User)
        .where(models.User.id == user_id)
    )
    target_user = db.execute(stmt).scalars().first()
    if not target_user:
        raise HTTPException(status_code = 404, detail = 'User not found')

    user = db.execute(select(models.User).where(models.User.id == current_user.id)).scalars().first()
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized, perhaps there is an error in the code')

    is_followed = user in target_user.followers
    if is_followed:
        target_user.followers.remove(user)
        followed = False
    else:
        target_user.followers.append(user)
        followed = True
    
    db.commit()

    return {
        'followed': followed
    }
