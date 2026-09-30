from fastapi import APIRouter

import os
import shutil
import uuid
import json

from pydantic import BaseModel
from typing import List, Optional

from fastapi import File, UploadFile, Form, Depends, HTTPException, Query, Response, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, func, desc

from jose import JWTError, jwt

from datetime import datetime, timedelta, timezone

from database import get_db, engine, Base
import models
import auth

router = APIRouter(prefix = '/api/news', tags = ['News', 'Announcements'])

@router.post('')
def post_article(title: str = Form(...), description: str = Form(...), type: str = Form(...), context: str = Form(...),
current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.id == current_user.id)).scalars().unique().first()
    if not user:
        raise HTTPException(status_code = 404, detail = 'User not found')
    if not user.is_admin:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')
    
    new_article = models.News(
        title = title,
        description = description,
        type = type,
        context = context,
        author_id = user.id
    )

    db.add(new_article)
    db.commit()

    return {'success': True, 'message': 'Article has been posted.'}

@router.get('')
def get_all_articles(db: Session = Depends(get_db)):
    stmt = (
        select(models.News)
        .order_by(models.News.created_at.desc())
    )
    articles = db.execute(stmt).scalars().unique().all()

    results = []
    for article in articles:
        author = db.execute(select(models.User.username).where(models.User.id == article.author_id)).scalars().first()
        if not author:
            raise HTTPException(status_code = 404, detail = 'Author not found. Break.')

        results.append({
            'id': article.id,
            'title': article.title,
            'description': article.description,
            'type': article.type
        })
    
    return results

@router.get('')
def get_latest_five_articles(db: Session = Depends(get_db)):
    stmt = (
        select(models.News)
        .order_by(models.News.created_at.desc())
        .limit(5)
    )
    articles = db.execute(stmt).scalars().unique().all()

    results = []
    for article in articles:
        author = db.execute(select(models.User.username).where(models.User.id == article.author_id)).scalars().first()
        if not author:
            raise HTTPException(status_code = 404, detail = 'Author not found. Break.')

        results.append({
            'id': article.id,
            'title': article.title,
            'type': article.type,
            'created_at': article.created_at,
        })
    
    return results

@router.get('/article/{id}')
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.execute(select(models.News).where(models.News.id == id)).scalars().unique().first()
    if not article:
        raise HTTPException(status_code = 404, detail = 'Article not found.')

    author = db.execute(select(models.User.username).where(models.User.id == article.author_id)).scalars().first()
    if not author:
        raise HTTPException(status_code = 404, detail = 'Author not found. Break.')
    
    return {'id': id, 'title': article.title, 'description': article.description, 'type': article.type, 'context': article.context, 'created_at': article.created_at, 'author': author}
