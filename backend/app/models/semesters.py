from app import db
from datetime import datetime

class Semester(db.Model):
    __tablename__ = 'semesters'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Fall 2024", "Spring 2025"
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='upcoming')  # upcoming, active, completed
    total_students = db.Column(db.Integer, default=0)
    total_fees = db.Column(db.Numeric(15, 2), default=0.00)
    collected_fees = db.Column(db.Numeric(15, 2), default=0.00)
    courses = db.Column(db.Text)  # Comma-separated list of courses
    holidays = db.Column(db.Text)  # Comma-separated list
    exam_period = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Semester {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'total_students': self.total_students,
            'total_fees': float(self.total_fees) if self.total_fees else 0,
            'collected_fees': float(self.collected_fees) if self.collected_fees else 0,
            'courses': self.courses.split(',') if self.courses else [],
            'holidays': self.holidays.split(',') if self.holidays else [],
            'exam_period': self.exam_period,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


