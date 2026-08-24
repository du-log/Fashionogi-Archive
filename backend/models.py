import uuid
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import relationship, mapped_column, Mapped
from database import Base

# Tags Junction Table
submission_tags = Table(
    "submission_tags",
    Base.metadata,
    Column("submission_id", Integer, ForeignKey("submissions.id", ondelete = "CASCADE"), primary_key = True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete = "CASCADE"), primary_key = True)
)

# User Model
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), default = uuid.uuid4, unique = True, nullable = False)
    username: Mapped[str] = mapped_column(String(50), unique = True, index = True, nullable = False)
    email: Mapped[str] = mapped_column(String(255), unique = True, index = True, nullable = False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable = False)

    is_admin: Mapped[bool] = mapped_column(Boolean, default = False, nullable = False)
    is_active: Mapped[bool] = mapped_column(Boolean, default = True, nullable = False)

    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates = "author", cascade = "all, delete-orphan")

# Global Equipment Dict Model
class BaseEquipment(Base):
    __tablename__ = "base_equipment"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    name: Mapped[str] = mapped_column(String(100), unique = True, index = True, nullable = False)
    slot: Mapped[str] = mapped_column(String(20), index = True, nullable = False)

    submission_instances: Mapped[List["SubmissionEquipment"]] = relationship(
        "SubmissionEquipment",
        back_populates = "base_item"
    )

# Preset Tags Model
class BaseTags(Base):
    __tablename__ = "base_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    name: Mapped[str] = mapped_column(String(50), unique = True, index = True, nullable = False)

# Tag Model
class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    name: Mapped[str] = mapped_column(String(50), unique = True, nullable = False)

    submissions: Mapped[List["Submission"]] = relationship(
        "Submission",
        secondary = submission_tags,
        back_populates = "tags"
    )

# Submission Image Model
class SubmissionImage(Base):
    __tablename__ = "submission_images"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    image_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), default = uuid.uuid4, unique = True, nullable = False)
    submission_id: Mapped[int] = mapped_column(Integer, ForeignKey("submissions.id", ondelete = "CASCADE"), nullable = False)
    display_order: Mapped[int] = mapped_column(Integer, default = 0, nullable = False)
    submission: Mapped["Submission"] = relationship("Submission", back_populates = "images")

# Submission Equipment Model
class SubmissionEquipment(Base):
    __tablename__ = "submission_equipment"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    submission_id: Mapped[int] = mapped_column(Integer, ForeignKey("submissions.id", ondelete = "CASCADE"), nullable = False)
    base_equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("base_equipment.id", ondelete = "RESTRICT"), nullable = False)

    dyeable: Mapped[bool] = mapped_column(Boolean, default = True, nullable = False)
    part_a: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)
    part_b: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)
    part_c: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)
    part_d: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)
    part_e: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)
    part_f: Mapped[Optional[str]] = mapped_column(String(7), nullable = True)

    submission: Mapped["Submission"] = relationship("Submission", back_populates = "equipment")
    base_item: Mapped["BaseEquipment"] = relationship("BaseEquipment", back_populates = "submission_instances")

# Submission Model
class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), nullable = False)
    title: Mapped[str] = mapped_column(String(100), index = True, nullable = False)
    description: Mapped[Optional[str]] = mapped_column(TEXT, nullable = True)
    gender: Mapped[str] = mapped_column(String(6), index = True, nullable = False)
    race: Mapped[str] = mapped_column(String(5), index = True, nullable = False)
    status: Mapped[str] = mapped_column(String(20), default = "pending", index = True, nullable = False)
    # "pending", "approved", "flagged_for_deletion", "rejected"
    created_at = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)

    author: Mapped["User"] = relationship(
        "User",
        back_populates = "submissions"
    )

    images: Mapped[List["SubmissionImage"]] = relationship(
        "SubmissionImage",
        back_populates = "submission",
        cascade = "all, delete-orphan",
        order_by = "SubmissionImage.display_order"
    )

    tags = relationship(
        "Tag",
        secondary = submission_tags,
        back_populates = "submissions"
    )

    equipment: Mapped[List["SubmissionEquipment"]] = relationship(
        "SubmissionEquipment",
        back_populates = "submission",
        cascade = "all, delete-orphan"
    )
