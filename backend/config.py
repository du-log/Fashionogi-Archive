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
