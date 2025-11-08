from app import db

class Teacher(db.Model):
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    # Relationship to timetable entries
    timetable_entries = db.relationship('TimetableEntry', back_populates='teacher')
