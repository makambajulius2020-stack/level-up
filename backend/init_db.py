#!/usr/bin/env python3
"""
Initialize the database and create all tables
"""
from app import create_app, db
from app.models.user import User, AuditLog, SystemSettings
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.models.notification import Notification
from app.models.online_class import OnlineClass, OnlineClassParticipant

def init_database():
    """Initialize database and create all tables"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Initializing database...")
        
        # Drop all tables (for fresh start)
        db.drop_all()
        print("🗑️  Dropped existing tables")
        
        # Create all tables
        db.create_all()
        print("✅ Created all tables")
        
        print("🎉 Database initialized successfully!")
        
        # List created tables
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"📋 Created tables: {', '.join(tables)}")

if __name__ == '__main__':
    init_database()
