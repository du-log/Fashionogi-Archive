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
from sqlalchemy.sql import func

from database import get_db, engine, Base
import models
import auth

router = APIRouter(prefix = '/api/auth', tags = ['Authentication'])

class RegisterParams(BaseModel):
    username: str
    email: str
    password: str

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
    response.delete_cookie(key = 'access_token', samesite = 'lax', secure = False)
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
        db.add(new_user)
        db.commit()

        return {
            'success': True,
            'message': 'Account successfully registered'
        }
    except e:
        raise HTTPException(status_code = 400, detail = str(e))

