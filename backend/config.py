import os

try:
    with open('.env') as file:
        for line in file:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
except FileNotFoundError:
    pass

SQLALCHEMY_DATABASE_URL = os.environ.get('DATABASE_URL')
SQLALCHEMY_DATABASE_URL_PROD = os.environ.get('PROD_DATABASE_URL')
SECRET_KEY = os.environ.get('SECRET_KEY')
ALGORITHM = os.environ.get('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 10080))

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = os.environ.get('DISCORD_REDIRECT_URI', 'http://localhost:8000/api/auth/discord/callback')

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback')
