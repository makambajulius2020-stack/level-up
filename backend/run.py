#!/usr/bin/env python3
"""
Smart School Backend - Unified Startup Script
Automatically detects SQLite vs MySQL
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
# Ensure we are running under the project's virtual environment Python (Windows)
venv_python = Path(__file__).parent / ".venv" / "Scripts" / "python.exe"
try:
    if venv_python.exists() and Path(sys.executable).resolve() != venv_python.resolve():
        os.environ.setdefault("PYTHONNOUSERSITE", "1")
        print(f"[bootstrap] Re-launching with venv interpreter: {venv_python}")
        os.execv(str(venv_python), [str(venv_python), __file__])
except Exception as _e:
    # If bootstrap fails, continue; downstream may still work if already in venv
    pass

from app import create_app, db

app = create_app()

# Only needed for `flask db` commands
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
    
# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class BackendManager:
    def __init__(self):
        self.processes = []
        self.running = True
        self.base_dir = Path(__file__).parent
        self.log_file = self.base_dir / "backend.log"
        
    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")

    def setup_environment(self):
        self.log("⚙️ Setting up environment...")
        os.environ.setdefault('FLASK_ENV', 'development')
        os.environ.setdefault('FLASK_DEBUG', 'True')
        os.environ.setdefault('PYTHONPATH', str(self.base_dir))

        # Load .env so local overrides apply
        load_dotenv(self.base_dir / ".env")

        # Force SQLite for local development always
        os.environ['DATABASE_URL'] = 'sqlite:///instance/school.db'
        self.log("ℹ️ Forced SQLite for local development (DATABASE_URL=sqlite:///instance/school.db)")

        # Detect type
        self.db_url = os.getenv('DATABASE_URL', 'sqlite:///instance/school.db')
        self.db_type = 'sqlite'
        self.log(f"✅ Detected database type: {self.db_type.upper()}")
        
        # Create necessary directories
        for directory in ['uploads', 'uploads/assignments', 'uploads/profiles', 'logs', 'instance']:
            dir_path = self.base_dir / directory
            dir_path.mkdir(exist_ok=True)

    def check_database_connection(self):
        """Check database connection depending on type"""
        self.log("🔍 Checking database connection...")
        if self.db_type == 'sqlite':
            db_path = self.db_url.replace('sqlite:///', '')
            if Path(db_path).exists() or 'memory' in db_path:
                self.log(f"✅ SQLite database OK ({db_path})")
                return True
            else:
                self.log(f"⚠️ SQLite database file not found, will create on first access: {db_path}")
                return True
        else:
            # For local dev we shouldn't be here, but keep a check
            try:
                import pymysql
                connection = pymysql.connect(
                    host=os.getenv('DB_HOST', 'localhost'),
                    user=os.getenv('DB_USER', 'root'),
                    password=os.getenv('DB_PASSWORD', ''),
                    database=os.getenv('DB_NAME', 'smart_school_db'),
                    charset='utf8mb4'
                )
                connection.close()
                self.log("✅ MySQL database connection - OK")
                return True
            except Exception as e:
                self.log(f"❌ MySQL connection error: {e}")
                self.log("↩️ Falling back to SQLite for local development")
                os.environ['DATABASE_URL'] = 'sqlite:///instance/school.db'
                self.db_url = os.environ['DATABASE_URL']
                self.db_type = 'sqlite'
                return True

    def create_database_if_not_exists(self):
        if self.db_type == 'sqlite':
            self.log("✅ SQLite does not require manual database creation")
            return True
        else:
            import pymysql
            try:
                connection = pymysql.connect(
                    host=os.getenv('DB_HOST', 'localhost'),
                    user=os.getenv('DB_USER', 'root'),
                    password=os.getenv('DB_PASSWORD', ''),
                    charset='utf8mb4'
                )
                with connection.cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('DB_NAME', 'smart_school_db')} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                connection.close()
                self.log("✅ MySQL database created/verified")
                return True
            except Exception as e:
                self.log(f"❌ Failed to create MySQL database: {e}")
                return False

    def start_main_backend(self):
        self.log("🚀 Starting main Flask backend...")
        from app import create_app
        app = create_app()
        
        port = 5000
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) == 0:
                self.log("⚠️ Port 5000 in use, switching to 5001")
                port = 5001
        
        def run_flask():
            # Log effective DB URI at runtime
            try:
                from flask import current_app
                with app.app_context():
                    uri = app.config.get('SQLALCHEMY_DATABASE_URI')
                    self.log(f"🗄️ SQLALCHEMY_DATABASE_URI = {uri}")
            except Exception:
                pass
            app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
        
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        time.sleep(2)
        self.log(f"✅ Flask backend started on port {port}")
        return True, port

    def run(self):
        self.log("🎯 Starting Smart School Backend...")
        self.setup_environment()
        self.check_database_connection()
        self.create_database_if_not_exists()
        success, port = self.start_main_backend()
        if success:
            self.log(f"🎉 Backend running at http://localhost:{port}")
        while True:
            time.sleep(1)

def main():
    manager = BackendManager()
    manager.run()

if __name__ == "__main__":
    main()
