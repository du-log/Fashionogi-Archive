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

router = APIRouter(prefix = '/api/admin', tags = ['Administrator'])

@router.get('/tags')
def admin_get_tags(db: Session = Depends(get_db)):
    stmt = (
        select(models.BaseTags)
        .order_by(models.BaseTags.name.asc())
    )

    results = db.execute(stmt).scalars().all()

    return [{'id': item.id, 'name': item.name, 'is_active': item.is_active} for item in results]

@router.patch('/tags/{tag_id}/toggle')
def admin_toggle_tag(tag_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(models.BaseTags)
        .where(models.BaseTags.id == tag_id)
    )
    tag = db.execute(stmt).scalars().first()
    if not tag:
        raise HTTPException(status_code = 404, detail = 'Tag not found in db')
    
    tag.is_active = not tag.is_active
    db.commit()

    return {'id': tag.id, 'is_active': tag.is_active}

@router.get('/pending')
def admin_get_pending(db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.status == 'pending')
        .order_by(models.Submission.created_at.asc())
        .options(
            selectinload(models.Submission.author),
            selectinload(models.Submission.images),
            selectinload(models.Submission.tags),
            selectinload(models.Submission.equipment).joinedload(models.SubmissionEquipment.base_item)
        )
    )

    submissions = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        equipment_data = []
        for eq in sub.equipment:
            equipment_data.append({
                'slot': eq.base_item.slot,
                'name': eq.base_item.name,
                'dyeable': eq.dyeable,
                'partA': eq.part_a,
                'partB': eq.part_b,
                'partC': eq.part_c,
                'partD': eq.part_d,
                'partE': eq.part_e,
                'partF': eq.part_f,
            })

        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            'description': sub.description,
            'gender': sub.gender,
            'race': sub.race,
            'created_at': sub.created_at,
            'equipment': equipment_data,
            'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images]
        })

    return {'items': results}

@router.patch('/pending/{sub_id}/approve')
def admin_approve_sub(sub_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(
            models.Submission.id == sub_id,
            models.Submission.status == 'pending'
        )
    )
    submission = db.execute(stmt).scalars().first()
    if not submission:
        raise HTTPException(status_code = 404, detail = 'Submission not found.')

    submission.status = 'approved'
    db.commit()

    return {'message': 'Approved submission', 'id': submission.id, 'status': submission.status}

@router.patch('/pending/{sub_id}/reject')
def admin_reject_sub(sub_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission.id, models.Submission.status)
        .where(
            models.Submission.id == sub_id,
            models.Submission.status == 'pending'
        )
    )
    submission = db.execute(stmt).scalars().first()
    if not submission:
        raise HTTPException(status_code = 404, detail = 'Submission not found or not in pending status.')

    submission.status = 'rejected'
    db.commit()

    return {'message': 'Rejected submission', 'id': submission.id, 'status': submission.status}