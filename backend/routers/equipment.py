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

router = APIRouter(prefix = '/api/equipment', tags = ['Equipment'])

# Equipment Search for ComboBox
@router.get('')
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