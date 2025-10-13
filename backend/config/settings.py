import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database configuration
    DB_HOST = os.environ.get('DB_HOST') or 'website-916f436f.ovv.whe.mybluehost.me'
    DB_NAME = os.environ.get('DB_NAME') or 'ovvwhemy_Alibee_DB'
    DB_USER = os.environ.get('DB_USER') or 'ovvwhemy_itzicks'
    DB_PASSWORD = os.environ.get('DB_PASSWORD') or 'qaLno2XsYS3l'
    DB_TABLENAME = os.environ.get('DB_TABLENAME') or 'saved_products'
    
    # AliExpress API configuration
    APP_KEY = os.environ.get('APP_KEY') or '514064'
    APP_SECRET = os.environ.get('APP_SECRET') or 'p8rJNLXoolmZKskeUrshCCbs45y4eWS9'
    TRACKING_ID = os.environ.get('TRACKING_ID') or 'Alibee'
    
    # API settings
    PRODUCTS_PER_PAGE = 10
    ALIEXPRESS_API_BASE_URL = 'https://api-sg.aliexpress.com/sync'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
