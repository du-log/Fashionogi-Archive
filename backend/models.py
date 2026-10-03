import uuid
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime, UniqueConstraint, Date, Text
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

# Favorites Join Table
user_favorites = Table(
    "user_favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete = "CASCADE"), primary_key = True),
    Column("submission_id", Integer, ForeignKey("submissions.id", ondelete = "CASCADE"), primary_key = True),
    Column("created_at", DateTime(timezone = True), server_default = func.now())
)

# Collections Join Table
collection_items = Table(
    "collection_items",
    Base.metadata,
    Column("collection_id", Integer, ForeignKey("collections.id", ondelete = "CASCADE"), primary_key = True),
    Column("submission_id", Integer, ForeignKey("submissions.id", ondelete = "CASCADE"), primary_key = True)
)

# User Model
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), default = uuid.uuid4, unique = True, nullable = False)
    username: Mapped[str] = mapped_column(String(50), unique = True, index = True, nullable = False)
    email: Mapped[str] = mapped_column(String(255), unique = True, index = True, nullable = False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable = False)
    avatar_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), default = uuid.uuid4, unique = True, nullable = True)

    is_admin: Mapped[bool] = mapped_column(Boolean, default = False, nullable = False)
    is_active: Mapped[bool] = mapped_column(Boolean, default = True, nullable = False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default = False, server_default = 'false', nullable = False)

    verification_token: Mapped[str] = mapped_column(String, nullable = True)

    created_at = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)
    last_login = mapped_column(DateTime(timezone = True), nullable = True)
    last_active = mapped_column(DateTime(timezone = True), nullable = True)

    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates = "author", cascade = "all, delete-orphan")
    collections = relationship("Collection", back_populates = "owner", cascade = "all, delete-orphan")
    favorite_submissions = relationship("Submission", secondary = user_favorites, back_populates = "favorited_by")

    profile: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates = "user", uselist = False, cascade = "all, delete-orphan")

# User Profile Model
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), primary_key = True, index = True)

    bio: Mapped[Optional[str]] = mapped_column(Text, index = True, nullable = True)
    server: Mapped[Optional[str]] = mapped_column(String(20), index = True, nullable = True)
    guild: Mapped[Optional[str]] = mapped_column(String(20), index = True, nullable = True)
    in_game_name: Mapped[Optional[str]] = mapped_column(String(30), index = True, nullable = True)
    main_race: Mapped[Optional[str]] = mapped_column(String(10), index = True, nullable = True)
    main_gender: Mapped[Optional[str]] = mapped_column(String(10), index = True, nullable = True)

    discord_username: Mapped[Optional[str]] = mapped_column(String(50), index = True, nullable = True)
    twitter_link: Mapped[Optional[str]] = mapped_column(String(100), index = True, nullable = True)
    twitch_link: Mapped[Optional[str]] = mapped_column(String(100), index = True, nullable = True)
    youtube_link: Mapped[Optional[str]] = mapped_column(String(100), index = True, nullable = True)

    user: Mapped["User"] = relationship("User", back_populates = "profile")

    @property
    def joined(self):
        return self.user.created_at

# Global Equipment Dict Model
class BaseEquipment(Base):
    __tablename__ = "base_equipment"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    name: Mapped[str] = mapped_column(String(200), unique = True, index = True, nullable = False)
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
    is_active: Mapped[bool] = mapped_column(Boolean, default = True, nullable = False)

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

# Collections Model
class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), nullable = False)
    title: Mapped[str] = mapped_column(String(100), nullable = False)
    created_at = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)

    owner = relationship("User", back_populates = "collections")
    items = relationship("Submission", secondary = collection_items, back_populates = "in_collections")

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
    # "pending", "approved", "flagged", "rejected", "unlisted", "deleted"

    is_active: Mapped[bool] = mapped_column(Boolean, default = True, server_default = 'true', nullable = False)
    delete_flag: Mapped[bool] = mapped_column(Boolean, default = False, server_default = 'false', nullable = False)

    created_at = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)

    favorited_by = relationship(
        "User",
        secondary = user_favorites,
        back_populates = "favorite_submissions"
    )

    in_collections = relationship(
        "Collection",
        secondary = collection_items,
        back_populates = "items"
    )

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

class News(Base):
    __tablename__ = "news_announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    title: Mapped[str] = mapped_column(String(255), index = True, nullable = False)
    description: Mapped[str] = mapped_column(String(255), index = True, nullable = False)
    type: Mapped[str] = mapped_column(String(50), index = True, nullable = False)
    context = mapped_column(Text, nullable = False)
    created_at = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable = False)

class DailyVisitor(Base):
    __tablename__ = "daily_visitors"

    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)

    visit_date = mapped_column(Date, server_default = func.current_date(), index = True)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), nullable = False, index = True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable = True, index = True)

    __table_args__ = (
        UniqueConstraint("visit_date", "session_id", name = "uix_daily_session"),
    )
