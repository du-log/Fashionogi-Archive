import os
import shutil
import uuid
import json

from pydantic import BaseModel
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select

from database import get_db, engine, Base
import models

Base.metadata.create_all(bind = engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

SUBMISSIONS_DIR = os.path.join(UPLOAD_DIR, 'submissions')
AVATARS_DIR = os.path.join(UPLOAD_DIR, 'avatars')

os.makedirs(SUBMISSIONS_DIR, exist_ok = True)
os.makedirs(AVATARS_DIR, exist_ok = True)

app.mount('/uploads', StaticFiles(directory = UPLOAD_DIR), name = 'uploads')

# deprecated
@app.post('/upload')
async def upload_img(caption: str = Form(...), file: UploadFile = File(...)):
    unique_id = uuid.uuid4().hex
    unique_filename = f"{unique_id}.webp"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_location, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    img_url_path = f"/uploads/{unique_filename}"
    with engine.begin() as con:
        con.execute(
            text("INSERT INTO test_gallery (caption, image_path) VALUES (:c, :p)"),
            {'c': caption, 'p': img_url_path}
        )
    
    return {'message': 'success', 'path': img_url_path}

# deprecated
@app.get('/gallery')
def get_gallery():
    with engine.connect() as con:
        result = con.execute(text('select id, caption, image_path from test_gallery order by id desc'))
        items = [{'id': row[0], 'caption': row[1], 'image_path': row[2]} for row in result]
    
    return items

# Equipment Search for ComboBox
@app.get('/equipment/search')
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

    return[{'id': item.id, 'name': item.name} for item in results]

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

@app.post('/submission/upload')
async def upload_submission(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    gender: str = Form(...),
    race: str = Form(...),
    tags: str = Form(...),
    equipment: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
    # current_user: models.User = Depends(auth.get_current_user)
):
    # Dummy User - REMOVE BEFORE PRODUCTION
    dev_user = db.query(models.User).first()
    if not dev_user:
        dev_user = models.User(username = 'TestUser', email ='test@test.com', hashed_password = 'mock')
        db.add(dev_user)
        db.flush()

    # Parsing data
    parsed_tags: List[str] = json.loads(tags)
    raw_equipment = json.loads(equipment)
    parsed_equipment: List[EquipmentPayload] = [EquipmentPayload(**item) for item in raw_equipment]

    new_submission = models.Submission(
        user_id = dev_user.id,
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

        file_path = os.path.join(SUBMISSIONS_DIR, f'{image_uuid.hex}.webp')
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

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

@app.get('/submission/gallery')
def get_submission_gallery(db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.status == 'approved')
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images)
        )
        .order_by(models.Submission.created_at.desc())
        .limit(50)
    )

    submissions = db.execute(stmt).scalars().unique().all()

    results = []
    for sub in submissions:
        sorted_images = sorted(sub.images, key = lambda x: x.display_order)
        results.append({
            'id': sub.id,
            'title': sub.title,
            'author': sub.author.username,
            'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images]
        })
    
    return results

@app.get('/submission/id/{submission_id}')
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(models.Submission)
        .where(models.Submission.id == submission_id)
        .options(
            joinedload(models.Submission.author),
            selectinload(models.Submission.images),
            selectinload(models.Submission.tags),
            selectinload(models.Submission.equipment).joinedload(models.SubmissionEquipment.base_item)
        )
    )

    sub = db.execute(stmt).scalars().first()
    if not sub:
        raise HTTPException(status_code = 404, detail = 'Submission not found.')

    sorted_images = sorted(sub.images, key=lambda x: x.display_order)
    
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
        'tags': [tag.name for tag in sub.tags],
        'images': [f'/uploads/submissions/{img.image_id.hex}.webp' for img in sorted_images],
        'equipment': equipment_data
    }