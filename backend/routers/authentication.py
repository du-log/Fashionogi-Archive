from urllib.parse import urlencode

from fastapi import APIRouter

import os
import shutil
import uuid
import json

from fastapi.responses import RedirectResponse
import httpx
from pydantic import BaseModel
from typing import List, Optional

from fastapi import File, UploadFile, Form, Depends, HTTPException, Query, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select
from sqlalchemy.sql import func

from config import DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
from database import get_db, engine, Base
import models
import auth

import secrets
import string

router = APIRouter(prefix = '/api/auth', tags = ['Authentication'])

class RegisterParams(BaseModel):
    username: str
    email: str
    password: str

RECOVERY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

def generate_raw_code() -> str:
    groups = [''.join(secrets.choice(RECOVERY_ALPHABET) for _ in range(4)) for _ in range(3)]
    return f'MABI-{'-'.join(groups)}'

class RecoveryResetPayload(BaseModel):
    username: str
    recovery_code: str
    new_password: str

@router.post('/login')
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(
            models.User.email == form_data.username,
        )
    )

    user = db.execute(stmt).scalars().first()
    if not user or not user.hashed_password or not auth.verify_pw(form_data.password, user.hashed_password):
        raise HTTPException(status_code = 400, detail = 'Invalid email or password')
    user.last_login = func.now()
    db.commit()
    
    access_token = auth.create_token(data = { 'sub': str(user.id) })

    response.set_cookie(
        key = 'access_token',
        value = access_token,
        httponly = True,
        max_age = 604800, # 7 days token life
        samesite = 'none',
        secure = True
    )

    return { 'message': 'Logged in successfully', 'user': { 'id': user.id, 'username': user.username, 'user_id': user.user_id } }

@router.post('/logout')
def logout(response: Response):
    response.delete_cookie(
        key = 'access_token',
        httponly = True,
        samesite = 'none',
        secure = True
    )
    return { 'message': 'Logged out successfully' }

@router.post('/register')
def register(response: Response, username = Form(...), email = Form(...), password = Form(...), db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.email == email)
    )

    stmt2 = (
        select(models.User)
        .where(models.User.username == username)
    )

    emailUsed = db.execute(stmt).scalars().first()
    if emailUsed:
        return {
            'success': False,
            'message': 'Email is already associated with an account',
            'type': 'AccEmailHas'
        }

    usernameUsed = db.execute(stmt2).scalars().first()
    if usernameUsed:
        return {
            'success': False,
            'message': 'Username is already associated with an account',
            'type': 'AccNameHas'
        }

    try:
        pw_hash = auth.get_pw_hash(password)
        new_user = models.User(username = username, email = email, hashed_password = pw_hash)
        new_profile = models.UserProfile()
        new_user.profile = new_profile

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            'success': True,
            'message': 'Account successfully registered'
        }
    except Exception as e:
        raise HTTPException(status_code = 400, detail = str(e))

@router.post('/recovery-code/generate')
def generate_recovery_code(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')
    
    raw_code = generate_raw_code()
    normalized = raw_code.replace('-', '').strip().upper()
    current_user.hashed_recovery_code = auth.get_pw_hash(normalized)
    db.commit()

    return {'recovery_code': raw_code}

@router.post('/recovery-code/reset')
def reset_password_using_recovery_code(payload: RecoveryResetPayload, db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.username == payload.username)
    )
    user = db.execute(stmt).scalars().first()
    normalized_input = payload.recovery_code.replace('-', '').strip().upper()

    if not user or not user.hashed_recovery_code:
        raise HTTPException(status_code = 400, detail = 'Invalid username or recovery code')
    
    if not auth.verify_pw(normalized_input, user.hashed_recovery_code):
        raise HTTPException(status_code = 400, detail = 'Invalid username or recovery code')

    user.hashed_password = auth.get_pw_hash(payload.new_password)
    user.hashed_recovery_code = None
    db.commit()

    return {'success': True, 'message': 'Password has been changed. For your safety, please generate a new recovery code.'}

@router.get('/discord/login')
def discord_login():
    params = urlencode({
        'client_id': DISCORD_CLIENT_ID,
        'redirect_uri': DISCORD_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'identify email'
    })
    return RedirectResponse(f'https://discord.com/api/oauth2/authorize?{params}')

@router.get('/google/login')
def google_login():
    params = urlencode({
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'online'
    })
    return RedirectResponse(f'https://accounts.google.com/o/oauth2/v2/auth?{params}')

@router.get('/discord/callback')
def discord_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)
):
    if error or not code:
        return RedirectResponse(f'{FRONTEND_URL}/login?error=discord_cancelled')

    try:
        with httpx.Client(timeout = 10.0) as client:
            token_res = client.post(
                'https://discord.com/api/oauth2/token',
                data = {
                    'client_id': DISCORD_CLIENT_ID,
                    'client_secret': DISCORD_CLIENT_SECRET,
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': DISCORD_REDIRECT_URI,
                },
                headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            )
            if token_res.status_code != 200:
                return RedirectResponse(f'{FRONTEND_URL}/login?error=discord_failed')

            access_token = token_res.json().get('access_token')
            user_res = client.get(
                'https://discord.com/api/users/@me',
                headers = {'Authorization': f'Bearer {access_token}'}
            )
            if user_res.status_code != 200:
                return RedirectResponse(f'{FRONTEND_URL}/login?error=discord_failed')
            profile = user_res.json()
    except httpx.RequestError:
        return RedirectResponse(f'{FRONTEND_URL}/login?error=discord_timeout')

    try:
        user = auth.resolve_oauth_user(
            provider = 'discord',
            provider_id = str(profile['id']),
            email = profile.get('email'),
            email_verified = bool(profile.get('verified')),
            display_name = profile.get('global_name') or profile.get('username', 'Milletian'),
            current_user = current_user,
            db = db
        )
    except HTTPException:
        return RedirectResponse(f'{FRONTEND_URL}/account/settings?error=discord_already_linked')

    response = RedirectResponse(f'{FRONTEND_URL}/account/settings')
    auth.set_auth_cookie(response, user.id)
    return response

@router.get('/google/callback')
def google_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)
):
    if error or not code:
        return RedirectResponse(f'{FRONTEND_URL}/login?error=google_cancelled')

    try:
        with httpx.Client(timeout = 10.0) as client:
            token_res = client.post(
                'https://oauth2.googleapis.com/token',
                data = {
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'code': code,
                    'grant_type': 'authorization_code',
                    'redirect_uri': GOOGLE_REDIRECT_URI,
                }
            )
            if token_res.status_code != 200:
                return RedirectResponse(f'{FRONTEND_URL}/login?error=google_failed')

            access_token = token_res.json().get('access_token')
            user_res = client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers = {'Authorization': f'Bearer {access_token}'}
            )
            if user_res.status_code != 200:
                return RedirectResponse(f'{FRONTEND_URL}/login?error=google_failed')
            profile = user_res.json()
    except httpx.RequestError:
        return RedirectResponse(f'{FRONTEND_URL}/login?error=google_timeout')

    try:
        user = auth.resolve_oauth_user(
            provider = 'google',
            provider_id = str(profile['id']),
            email = profile.get('email'),
            email_verified = bool(profile.get('verified_email')),
            display_name = profile.get('name', 'Milletian'),
            current_user = current_user,
            db = db
        )
    except HTTPException:
        return RedirectResponse(f'{FRONTEND_URL}/account/settings?error=google_already_linked')

    response = RedirectResponse(f'{FRONTEND_URL}/account/settings')
    auth.set_auth_cookie(response, user.id)
    return response
