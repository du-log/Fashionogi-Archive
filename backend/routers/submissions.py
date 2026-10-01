from fastapi import APIRouter

import os
import shutil
import uuid
import json
import boto3

from botocore.config import Config

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

router = APIRouter(prefix = '/api/submissions', tags = ['Submissions'])

#BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

#SUBMISSIONS_DIR = os.path.join(UPLOAD_DIR, 'submissions')

#os.makedirs(SUBMISSIONS_DIR, exist_ok = True)

#router.mount('/uploads', StaticFiles(directory = UPLOAD_DIR), name = 'uploads')

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

# For upload_submission
class EquipmentPayload(BaseModel):
    slot: str
    name: str
    dyeable: bool
    partA: Optional[str] = None
    partB: Optional[str] = None
    partC: Optional[str] = None
    partD: Optional[str] = None
    partE: Optional[str] = None
    partF: Optional[str] = None

@router.post('')
async def upload_submission(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    gender: str = Form(...),
    race: str = Form(...),
    tags: str = Form(...),
    equipment: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized')

    twenty_four_hr_ago = datetime.now(timezone.utc) - timedelta(hours = 24)
    recent_subs_count = db.query(models.Submission).filter(
        models.Submission.user_id == user.id,
        models.Submission.created_at >= twenty_four_hr_ago
    ).count()
    if recent_subs_count >= 7:
        raise HTTPException(status_code = status.HTTP_429_TOO_MANY_REQUESTS, detail = 'You have reached the limit of 7 submissions per 24 hours. Please try again later.')
    
    # Parsing data
    parsed_tags: List[str] = json.loads(tags)
    raw_equipment = json.loads(equipment)
    parsed_equipment: List[EquipmentPayload] = [EquipmentPayload(**item) for item in raw_equipment]

    new_submission = models.Submission(
        user_id = user.id,
        title = title,
        description = description,
        gender = gender,
        race = race,
        status = 'pending'
    )
    db.add(new_submission)
    db.flush()

    for tag_name in parsed_tags:
        tag_obj = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not tag_obj:
            tag_obj = models.Tag(name = tag_name)
            db.add(tag_obj)
            db.flush()
        new_submission.tags.append(tag_obj)

    for eq in parsed_equipment:
        base_item = db.query(models.BaseEquipment).filter(
            models.BaseEquipment.name == eq.name,
            models.BaseEquipment.slot == eq.slot
        ).first()

        if not base_item:
            base_item = models.BaseEquipment(name = eq.name, slot = eq.slot)
            db.add(base_item)
            db.flush()

        sub_eq = models.SubmissionEquipment(
            submission_id = new_submission.id,
            base_equipment_id = base_item.id,
            dyeable = eq.dyeable,
            part_a = eq.partA,
            part_b = eq.partB,
            part_c = eq.partC,
            part_d = eq.partD,
            part_e = eq.partE,
            part_f = eq.partF
        )
        db.add(sub_eq)
    
    for index, file in enumerate(files):
        image_uuid = uuid.uuid4()
        r2_object_key = f'submissions/{image_uuid.hex}.webp'

        s3_client.upload_fileobj(
            file.file,
            R2_BUCKET_NAME,
            r2_object_key,
            ExtraArgs={'ContentType': 'image/webp'}
        )

        #file_path = os.path.join(SUBMISSIONS_DIR, f'{image_uuid.hex}.webp')
        #with open(file_path, 'wb') as buffer:
        #    shutil.copyfileobj(file.file, buffer)

        new_image = models.SubmissionImage(
            image_id = image_uuid,
            submission_id = new_submission.id,
            display_order = index
        )
        db.add(new_image)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code = 500, detail = f'Database commit failed: {str(e)}')

    print(f'Title: {title}')
    print(f'Gender: {gender}')
    print(f'Tags: {parsed_tags}')
    print(f'Equipment count: {len(parsed_equipment)}')

    return {'message': 'Upload successful', 'success': True, 'submission_id': new_submission.id}

@router.get('/latest')
def get_latest_ten(db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.status == 'approved')
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .order_by(models.Submission.created_at.desc())
        .limit(10)
    )

    submissions = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        favorites_count = len(sub.favorited_by)
        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            #'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'favorites': favorites_count
        })
    
    return results

@router.get('/top')
def get_top_five(db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .outerjoin(models.user_favorites, models.Submission.id == models.user_favorites.c.submission_id)
        .group_by(models.Submission.id)
        .order_by(desc(func.count(models.user_favorites.c.user_id)))
        .where(models.Submission.status == 'approved')
        .options(
            selectinload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .limit(5)
    )

    submissions = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        favorites_count = len(sub.favorited_by)
        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            #'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'favorites': favorites_count
        })
    
    return results

@router.get('/amount')
def get_submissions_amount(db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission.id)
        .where(models.Submission.status == 'approved')
        )

    submissions = db.execute(stmt).scalars().unique().all()

    return {'total_submissions': len(submissions)}

@router.get('')
def get_submission_gallery(
    title: Optional[str] = None,
    username: Optional[str] = None,
    tag: Optional[str] = None,
    gender: Optional[str] = None,
    race: Optional[str] = None,
    sort_by: str = Query('newest', alias='sortBy'),
    page: int = Query(1, ge = 1),
    limit: int = Query(15, ge = 1, le = 50),
    db: Session = Depends(get_db)
):
    stmt = (
        select(models.Submission)
        .where(models.Submission.status == 'approved')
        .options(
            selectinload(models.Submission.author),
            selectinload(models.Submission.images),
            selectinload(models.Submission.tags)
        )
    )

    if title:
        stmt = stmt.where(models.Submission.title.ilike(f'%{title}%'))
    
    if username:
        stmt = stmt.join(models.User).where(models.User.username.ilike(f'%{username}%'))

    if tag:
        stmt = stmt.where(models.Submission.tags.any(models.Tag.name.ilike(f'%{tag}%')))

    if gender:
        stmt = stmt.where(models.Submission.gender == gender)
    
    if race:
        stmt = stmt.where(models.Submission.race == race)

    if sort_by == 'oldest':
        stmt = stmt.order_by(models.Submission.created_at.asc())
    elif sort_by == 'favorites':
        stmt = (
            stmt.outerjoin(models.user_favorites, models.Submission.id == models.user_favorites.c.submission_id)
            .group_by(models.Submission.id)
            .order_by(desc(func.count(models.user_favorites.c.user_id)), models.Submission.created_at.desc())
        )
    else:
        stmt = stmt.order_by(models.Submission.created_at.desc())
    
    count = select(func.count()).select_from(stmt.subquery())
    total_items = db.execute(count).scalar()

    total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1

    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    submissions = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        favorites_count = len(sub.favorited_by)
        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            #'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images],
            'favorites': favorites_count
        })
    
    return {
        'items': results,
        'total_pages': total_pages,
        'current_page': page or 1,
        'total_items': total_items
    }

@router.get('/id/{submission_id}')
def get_submission(submission_id: int, db: Session = Depends(get_db), current_user: models.User | None = Depends(auth.get_optional_current_user)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.id == submission_id)
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images),
            selectinload(models.Submission.tags),
            selectinload(models.Submission.equipment).joinedload(models.SubmissionEquipment.base_item),
            selectinload(models.Submission.favorited_by)
            #selectinload(models.Submission.in_collections)
        )
    )

    sub = db.execute(stmt).scalars().first()
    if not sub:
        raise HTTPException(status_code = 404, detail = 'Submission not found.')

    if sub.status != 'approved':
        if not current_user:
            raise HTTPException(status_code = 404, detail = 'Submission not found.')
        
        if not current_user.is_admin and current_user.id != sub.user_id:
            raise HTTPException(status_code = 404, detail = 'Submission not found.')

    sorted_images = sorted(sub.images, key=lambda x: x.display_order)

    favorites_count = len(sub.favorited_by)
    is_favorited = False
    if current_user:
        is_favorited = current_user in sub.favorited_by
    
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

    return {
        'id': sub.id,
        'title': sub.title,
        'description': sub.description,
        'gender': sub.gender,
        'race': sub.race,
        'author': sub.author.username,
        'created_at': sub.created_at,
        'status': sub.status,
        'tags': [tag.name for tag in sub.tags],
        #'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images],
        'images': [f'{R2_PUBLIC_URL}/submissions/{img.image_id.hex}.webp' for img in sorted_images],
        'equipment': equipment_data,
        'favorites_count': favorites_count,
        'is_favorited': is_favorited
    }

@router.post('/id/{submission_id}/favorite')
def toggle_favorite(submission_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.id == submission_id)
    )
    sub = db.execute(stmt).scalars().first()
    if not sub:
        raise HTTPException(status_code = 404, detail = 'Submission not found')

    user = db.query(models.User).filter(models.User.id == current_user.id).first();
    if not user:
        raise HTTPException(status_code = 401, detail = 'Unauthorized, perhaps there is an error in the code')

    is_favorited = user in sub.favorited_by
    if is_favorited:
        sub.favorited_by.remove(user)
        favorited = False
    else:
        sub.favorited_by.append(user)
        favorited = True
    
    db.commit()

    total_favorites = len(sub.favorited_by)

    return {
        'favorited': favorited,
        'favorites_count': total_favorites
    }