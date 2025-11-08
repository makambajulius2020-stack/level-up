import os

# Database Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
os.makedirs(INSTANCE_DIR, exist_ok=True)  # <-- ensures folder exists
DB_PATH = os.path.join(INSTANCE_DIR, "school.db")
SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"

# Flask Configuration
DEBUG = True
SECRET_KEY = "your-secret-key-here"

# CORS Configuration
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3003"]
