from flask import Flask
from flask_cors import CORS
from config.settings import config

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS for frontend
    allowed_origins = [
        'http://localhost:3000', 
        'http://localhost:5173',
        'https://alibee-client.onrender.com',  # Add your frontend Render URL here
        'https://your-frontend-domain.com'     # Add your custom domain if you have one
    ]
    CORS(app, origins=allowed_origins)
    
    # Register routes
    from app.routes import main
    app.register_blueprint(main)
    
    return app
