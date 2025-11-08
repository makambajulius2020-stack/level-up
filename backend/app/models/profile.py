from app import db
from datetime import datetime
import os

class UserProfile(db.Model):
    """Extended user profile with photo and additional information"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    
    # Profile photo
    profile_photo_url = db.Column(db.String(500))
    profile_photo_filename = db.Column(db.String(255))
    
    # Personal information
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    nationality = db.Column(db.String(50), default='Ugandan')
    religion = db.Column(db.String(50))
    
    # Contact information
    address = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(120))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(50))
    
    # Academic information (for students)
    class_level = db.Column(db.String(10))  # S1, S2, S3, S4, S5, S6
    stream = db.Column(db.String(50))  # Science, Arts, etc.
    admission_date = db.Column(db.Date)
    student_number = db.Column(db.String(20))
    
    # Staff information (for teachers/staff)
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    hire_date = db.Column(db.Date)
    employee_number = db.Column(db.String(20))
    subjects_taught = db.Column(db.Text)  # JSON array of subjects
    
    # Student information (for teachers/admins managing students)
    students_ids = db.Column(db.Text)  # JSON array of student IDs
    
    # System preferences
    notification_preferences = db.Column(db.Text)  # JSON preferences
    language_preference = db.Column(db.String(10), default='en')
    theme_preference = db.Column(db.String(20), default='light')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('profile', uselist=False))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'profile_photo_url': self.profile_photo_url,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'nationality': self.nationality,
            'religion': self.religion,
            'address': self.address,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relationship': self.emergency_contact_relationship,
            'class_level': self.class_level,
            'stream': self.stream,
            'admission_date': self.admission_date.isoformat() if self.admission_date else None,
            'student_number': self.student_number,
            'department': self.department,
            'position': self.position,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'employee_number': self.employee_number,
            'subjects_taught': self.subjects_taught,
            'students_ids': self.students_ids,
            'notification_preferences': self.notification_preferences,
            'language_preference': self.language_preference,
            'theme_preference': self.theme_preference,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Assignment(db.Model):
    """Digital assignment management"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Assignment details
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    class_level = db.Column(db.String(10), nullable=False)
    
    # Dates
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    
    # Assignment settings
    max_marks = db.Column(db.Integer, default=100)
    submission_format = db.Column(db.String(50))  # pdf, doc, text, etc.
    plagiarism_check_enabled = db.Column(db.Boolean, default=True)
    ai_grading_enabled = db.Column(db.Boolean, default=False)
    
    # Status
    is_published = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    teacher = db.relationship('User', backref='assignments_created')
    #submissions = db.relationship('AssignmentSubmission', backref='assignment', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.name if self.teacher else None,
            'subject': self.subject,
            'class_level': self.class_level,
            'created_date': self.created_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'max_marks': self.max_marks,
            'submission_format': self.submission_format,
            'plagiarism_check_enabled': self.plagiarism_check_enabled,
            'ai_grading_enabled': self.ai_grading_enabled,
            'is_published': self.is_published,
            'is_active': self.is_active
        }


class Message(db.Model):
    """Secure messaging system"""
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Message content
    subject = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, file, announcement
    
    # File attachment
    attachment_path = db.Column(db.String(500))
    attachment_name = db.Column(db.String(255))
    
    # Status
    is_read = db.Column(db.Boolean, default=False)
    is_urgent = db.Column(db.Boolean, default=False)
    is_deleted_by_sender = db.Column(db.Boolean, default=False)
    is_deleted_by_recipient = db.Column(db.Boolean, default=False)
    
    # Timestamps
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name if self.sender else None,
            'recipient_id': self.recipient_id,
            'recipient_name': self.recipient.name if self.recipient else None,
            'subject': self.subject,
            'content': self.content,
            'message_type': self.message_type,
            'attachment_name': self.attachment_name,
            'is_read': self.is_read,
            'is_urgent': self.is_urgent,
            'sent_at': self.sent_at.isoformat(),
            'read_at': self.read_at.isoformat() if self.read_at else None
        }

class LessonPlan(db.Model):
    """UNEB-aligned lesson planning"""
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Lesson details
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    class_level = db.Column(db.String(10), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    
    # UNEB alignment
    uneb_objective = db.Column(db.Text)
    learning_outcomes = db.Column(db.Text)  # JSON array
    uneb_competencies = db.Column(db.Text)  # JSON array
    
    # Lesson content
    introduction = db.Column(db.Text)
    main_content = db.Column(db.Text)
    activities = db.Column(db.Text)  # JSON array
    assessment_methods = db.Column(db.Text)  # JSON array
    resources_needed = db.Column(db.Text)  # JSON array
    homework = db.Column(db.Text)
    
    # AI suggestions
    ai_suggestions = db.Column(db.Text)  # JSON array of AI recommendations
    ai_generated_content = db.Column(db.Text)
    
    # Timing
    duration_minutes = db.Column(db.Integer, default=40)
    lesson_date = db.Column(db.Date)
    period_number = db.Column(db.Integer)
    
    # Status
    is_completed = db.Column(db.Boolean, default=False)
    effectiveness_rating = db.Column(db.Integer)  # 1-5 rating
    teacher_reflection = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = db.relationship('User', backref='lesson_plans')
    
    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.name if self.teacher else None,
            'title': self.title,
            'subject': self.subject,
            'class_level': self.class_level,
            'topic': self.topic,
            'uneb_objective': self.uneb_objective,
            'learning_outcomes': self.learning_outcomes,
            'uneb_competencies': self.uneb_competencies,
            'introduction': self.introduction,
            'main_content': self.main_content,
            'activities': self.activities,
            'assessment_methods': self.assessment_methods,
            'resources_needed': self.resources_needed,
            'homework': self.homework,
            'ai_suggestions': self.ai_suggestions,
            'duration_minutes': self.duration_minutes,
            'lesson_date': self.lesson_date.isoformat() if self.lesson_date else None,
            'period_number': self.period_number,
            'is_completed': self.is_completed,
            'effectiveness_rating': self.effectiveness_rating,
            'teacher_reflection': self.teacher_reflection,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CoCurricularActivity(db.Model):
    """Co-curricular activities tracking"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100))  # Sports, Arts, Clubs, etc.
    description = db.Column(db.Text)
    
    # Activity details
    coordinator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    meeting_schedule = db.Column(db.String(255))
    location = db.Column(db.String(255))
    
    # Participation tracking
    max_participants = db.Column(db.Integer)
    current_participants = db.Column(db.Integer, default=0)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    registration_open = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    coordinator = db.relationship('User', backref='coordinated_activities')
    participants = db.relationship('CoCurricularParticipation', backref='activity', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'coordinator_id': self.coordinator_id,
            'coordinator_name': self.coordinator.name if self.coordinator else None,
            'meeting_schedule': self.meeting_schedule,
            'location': self.location,
            'max_participants': self.max_participants,
            'current_participants': self.current_participants,
            'is_active': self.is_active,
            'registration_open': self.registration_open,
            'created_at': self.created_at.isoformat()
        }

class CoCurricularParticipation(db.Model):
    """Student participation in co-curricular activities"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('co_curricular_activity.id'), nullable=False)
    
    # Participation details
    joined_date = db.Column(db.Date, default=datetime.utcnow)
    role = db.Column(db.String(100))  # Member, Captain, Secretary, etc.
    performance_rating = db.Column(db.Integer)  # 1-5 rating
    
    # Attendance tracking
    sessions_attended = db.Column(db.Integer, default=0)
    total_sessions = db.Column(db.Integer, default=0)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    student = db.relationship('User', backref='profile_participations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'activity_id': self.activity_id,
            'joined_date': self.joined_date.isoformat() if self.joined_date else None,
            'role': self.role,
            'performance_rating': self.performance_rating,
            'sessions_attended': self.sessions_attended,
            'total_sessions': self.total_sessions,
            'attendance_rate': (self.sessions_attended / self.total_sessions * 100) if self.total_sessions > 0 else 0,
            'is_active': self.is_active
        }
