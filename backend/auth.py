from datetime import datetime, timedelta
import re
import secrets
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Response, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.sql import func
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserProfile
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pw_context = CryptContext(schemes = ['bcrypt'], deprecated = 'auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl = 'login')

def verify_pw(plain_pw, hashed_pw):
    return pw_context.verify(plain_pw, hashed_pw)

def get_pw_hash(password):
    return pw_context.hash(password)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({ 'exp': expire })
    return jwt.encode(to_encode, SECRET_KEY, algorithm = ALGORITHM)

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code = 401, detail = 'Not authenticated')
    cred_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = 'Could not validate',
        headers = {'WWW_Authenticate': 'Bearer'},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise cred_exception
    except JWTError:
        raise cred_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise cred_exception
    return user

def get_optional_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        #print('Token does not exist')
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except JWTError:
        return None
    return None

def set_auth_cookie(response: Response, user_id: int):
    access_token = create_token(data = { 'sub': str(user_id) })
    
    response.set_cookie(
        key = 'access_token',
        value = access_token,
        httponly = True,
        max_age = 604800, # 7 days token life
        samesite = 'none',
        secure = True
    )

def get_unique_username(base_name: str, db: Session) -> str:
    clean = re.sub(r'[^a-zA-Z0-9_]', '', base_name)[:16] or 'Milletian'
    candidate = clean

    
    while db.execute(select(User).where(User.username == candidate)).scalars().first():
        candidate = f'{clean}_{secrets.token_hex(2)}'
    return candidate

def resolve_oauth_user(provider: str, provider_id: str, email: Optional[str], email_verified: bool, display_name: str, current_user: Optional[User], db: Session) -> User:
    id_attribute = 'discord_id' if provider == 'discord' else 'google_id'
    id_column = User.discord_id if provider == 'discord' else User.google_id

    linkingStmt = (select(User).where(id_column == provider_id))
    if current_user:
        existing_owner = db.execute(linkingStmt).scalars().first()
        if existing_owner and existing_owner.id != current_user.id:
            raise HTTPException(status_code = 400, detail = f'This {provider.title()} account is already linked to another user.')

        setattr(current_user, id_attribute, provider_id)
        if email_verified:
            current_user.is_verified = True
        db.commit()
        return current_user

    existingLoginStmt = (select(User).where(id_column == provider_id))
    user = db.execute(existingLoginStmt).scalars().first()
    if user:
        user.last_login = func.now()
        db.commit()
        return user

    existingVerifiedStmt = (select(User).where(User.email == email))
    if email and email_verified:
        user = db.execute(existingVerifiedStmt).scalars().first()
        if user:
            setattr(user, id_attribute, provider_id)
            user.is_verified = True
            user.last_login = func.now()
            db.commit()
            return user

    new_user = User(
        username = get_unique_username(display_name, db),
        email = email,
        hashed_password = None,
        is_verified = email_verified,
        last_login = func.now(),
        **{id_attribute: provider_id}
    )
    new_user.profile = UserProfile()
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
