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

router = APIRouter(prefix = '/api/misc', tags = ['Miscellaneous'])

# Equipment Search for ComboBox
@router.get('/equipment')
def search_equipment(q: str, slot: str, db: Session = Depends(get_db)):
    if len(q) < 3:
        return []

    stmt = (
        select(models.BaseEquipment)
        .where(
            models.BaseEquipment.slot == slot,
            models.BaseEquipment.name.ilike(f"%{q}%")
        )
        .limit(10)
    )

    results = db.execute(stmt).scalars().all()

    return [{'id': item.id, 'name': item.name} for item in results]

@router.get('/tags')
def search_tags(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = (
        select(models.BaseTags)
        .where(models.BaseTags.is_active == True)
        .order_by(models.BaseTags.name.asc())
    )

    if q:
        stmt = stmt.where(models.BaseTags.name.ilike(f"%{q}%"))

    results = db.execute(stmt).scalars().all()

    return [{'id': item.id, 'name': item.name} for item in results]

@router.get('/search')
def search_by_query(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    userStmt = (
        select(models.User.username)
        .where(models.User.is_active == True)
        .order_by(models.User.username.asc())
    )
    if q:
        userStmt = userStmt.where(models.User.username.ilike(f"%{q}%"))

    subStmt = (
        select(models.Submission.title)
        .where(
            models.Submission.status == 'approved',
            models.Submission.is_active == True
        )
        .order_by(models.Submission.title.asc())
    )
    if q:
        subStmt = subStmt.where(models.Submission.title.ilike(f"%{q}%"))

    users = db.execute(userStmt).scalars().all()
    submissions = db.execute(subStmt).scalars().all()

    names = []
    titles = []

    for user in users:
        names.append({'username': user.username})

    for sub in submissions:
        titles.append({'title': sub.title})

    return {
        'usernames': names,
        'titles': titles
    }