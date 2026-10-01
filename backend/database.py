from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import SQLALCHEMY_DATABASE_URL, SQLALCHEMY_DATABASE_URL_PROD

#engine = create_engine(SQLALCHEMY_DATABASE_URL)
engine = create_engine(SQLALCHEMY_DATABASE_URL_PROD)
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
