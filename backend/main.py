from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_db, engine, Base
import models

from routers import authentication, equipment, submissions, users

Base.metadata.create_all(bind = engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins = ['http://localhost:5173'],
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*'],
)

app.include_router(authentication.router)
app.include_router(equipment.router)
app.include_router(submissions.router)
app.include_router(users.router)

@app.get('/')
def root():
    return {'message': 'API is online.'}
