from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_db, engine, Base
import models

from routers import authentication, miscellaneous, submissions, users, admin, news

Base.metadata.create_all(bind = engine)

origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fashionogi-archive.vercel.app',
    'https://fashionogi-archive.app'
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*'],
)

app.include_router(authentication.router)
app.include_router(miscellaneous.router)
app.include_router(submissions.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(news.router)

@app.get('/')
def root():
    return {'message': 'API is online.'}
