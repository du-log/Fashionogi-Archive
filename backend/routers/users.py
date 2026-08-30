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
import models, auth

router = APIRouter(prefix = '/api/users', tags = ['Users'])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

AVATARS_DIR = os.path.join(UPLOAD_DIR, 'avatars')

os.makedirs(AVATARS_DIR, exist_ok = True)

router.mount('/uploads', StaticFiles(directory = UPLOAD_DIR), name = 'uploads')

@router.get('/me')
def get_user_me(current_user: models.User = Depends(auth.get_current_user)):
    return { 'id': current_user.id, 'username': current_user.username }