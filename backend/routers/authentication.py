from fastapi import APIRouter

import os
import shutil
import uuid
import json

from pydantic import BaseModel
from typing import List, Optional

from fastapi import File, UploadFile, Form, Depends, HTTPException, Query, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select

from database import get_db, engine, Base
import models
import auth

router = APIRouter(prefix = '/api/auth', tags = ['Authentication'])

@router.post('/login')
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(
            models.User.email == form_data.username,
        )
    )

    user = db.execute(stmt).scalars().first()
    if not user or not auth.verify_pw(form_data.password, user.hashed_password):
        raise HTTPException(status_code = 400, detail = 'Invalid email or password')
    
    
    access_token = auth.create_token(data = { 'sub': str(user.id) })

    response.set_cookie(
        key = 'access_token',
        value = access_token,
        httponly = True,
        max_age = 604800,
        samesite = 'lax',
        secure = False
    )

    return { 'message': 'Logged in successfully', 'user': { 'id': user.id, 'username': user.username, 'user_id': user.user_id } }

@router.post('/logout')
def logout(response: Response):
    response.delete_cookie(key = 'access_token', samesite = 'lax', secure = False)
    return { 'message': 'Logged out successfully' }

@router.pot('/register')
def register(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    stmt = (
        select(models.User)
        .where(models.User.email == form_data.email)
    )

    account = db.execute(stmt).scalars().first()
    if account:
        return {
            'success': False,
            'message': 'Email is already associated with an account',
            'type': 'accEmailHas'
        }