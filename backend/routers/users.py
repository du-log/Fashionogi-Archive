from fastapi import APIRouter

import os
import shutil
import uuid
import json

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from fastapi import File, UploadFile, Form, Depends, HTTPException, Query, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, desc
from sqlalchemy.sql import func

from database import get_db, engine, Base
import models, auth

router = APIRouter(prefix = '/api/users', tags = ['Users'])

R2_PUBLIC_URL = os.environ.get('R2_PUBLIC_URL')

#BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

#AVATARS_DIR = os.path.join(UPLOAD_DIR, 'avatars')

#os.makedirs(AVATARS_DIR, exist_ok = True)

#router.mount('/uploads', StaticFiles(directory = UPLOAD_DIR), name = 'uploads')

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

    class Config:
        from_attributes: True

@router.get('/me')
def get_user_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.username == current_user.username)).scalars().first()
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')
    user.last_active = func.now()
    return { 'id': current_user.id, 'username': current_user.username, 'is_admin': current_user.is_admin }

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

    if not auth.verify_pw(password, user.password):
        raise HTTPException(status_code = 400, detail = 'Passwords do not match.')

    return {'success': True,'message': 'Password successfully verified.'}
