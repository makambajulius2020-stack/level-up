from datetime import datetime
from app import db
from app.models.class_management import SchoolClass
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Course(db.Model):
    __tablename__ = 'subjects'  # Keep table name for database compatibility
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text)
    
    # Academic Details
    class_level = Column(String(10), nullable=False)  # S1, S2, S3, S4, S5, S6
    credits = Column(Integer, default=4)
    is_core = Column(Boolean, default=True)  # Core vs Elective
    department = Column(String(100))
    
    # UNEB Curriculum Alignment
    uneb_code = Column(String(20))
    curriculum_year = Column(Integer, default=2024)
    syllabus_topics = Column(JSON)  # List of curriculum topics
    
    # Teaching Resources
    textbook = Column(String(200))
    reference_materials = Column(JSON)  # List of reference materials
    practical_required = Column(Boolean, default=False)
    
    # Assessment Configuration
    continuous_assessment_weight = Column(Float, default=40.0)  # Percentage
    final_exam_weight = Column(Float, default=60.0)  # Percentage
    pass_mark = Column(Float, default=50.0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    creator = relationship('User', backref='created_courses')
    class_subjects = relationship('CourseClass', back_populates='course', cascade='all, delete-orphan')
    student_subjects = relationship('StudentCourse', back_populates='course', cascade='all, delete-orphan')
    class_schedules = relationship('ClassSchedule', back_populates='course')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'class_level': self.class_level,
            'credits': self.credits,
            'is_core': self.is_core,
            'department': self.department,
            'uneb_code': self.uneb_code,
            'curriculum_year': self.curriculum_year,
            'syllabus_topics': self.syllabus_topics,
            'textbook': self.textbook,
            'reference_materials': self.reference_materials,
            'practical_required': self.practical_required,
            'continuous_assessment_weight': self.continuous_assessment_weight,
            'final_exam_weight': self.final_exam_weight,
            'pass_mark': self.pass_mark,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CourseClass(db.Model):
    __tablename__ = 'class_subjects'  # Keep table name for database compatibility
    
    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Teaching Schedule
    periods_per_week = Column(Integer, default=4)
    room = Column(String(50))
    
    # Academic Year
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(10), nullable=False)  # Semester 1, Semester 2, Semester 3
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ref = relationship('SchoolClass', backref='class_subjects')
    course = relationship('Course', foreign_keys=[subject_id], back_populates='class_subjects')
    teacher = relationship('User', backref='teaching_subjects')
    
    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'class_name': self.class_ref.name if self.class_ref else None,
            'course_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'subject_code': self.course.code if self.course else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'periods_per_week': self.periods_per_week,
            'room': self.room,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class StudentCourse(db.Model):
    __tablename__ = 'student_subjects'  # Keep table name for database compatibility
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    class_subject_id = Column(Integer, ForeignKey('class_subjects.id'), nullable=False)
    
    # Enrollment Details
    enrollment_date = Column(DateTime, default=datetime.utcnow)
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(10), nullable=False)
    
    # Performance Tracking
    current_grade = Column(Float)  # Current percentage
    class_average = Column(Float)  # Class average for comparison
    attendance_percentage = Column(Float, default=0.0)
    
    # Assignment Tracking
    assignments_submitted = Column(Integer, default=0)
    assignments_pending = Column(Integer, default=0)
    assignments_graded = Column(Integer, default=0)
    
    # Progress Tracking
    topics_completed = Column(JSON)  # List of completed topics with progress
    next_class = Column(DateTime)
    
    # Performance Trend
    trend = Column(String(20), default='stable')  # up, down, stable
    improvement_percentage = Column(Float, default=0.0)
    recent_scores = Column(JSON)  # Last 5 scores
    
    # Status
    is_active = Column(Boolean, default=True)
    dropped_date = Column(DateTime)
    drop_reason = Column(String(200))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', backref='student_subjects')
    course = relationship('Course', foreign_keys=[subject_id], back_populates='student_subjects')
    class_subject = relationship('CourseClass', foreign_keys=[class_subject_id], backref='enrolled_students')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'course_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'subject_code': self.course.code if self.course else None,
            'class_subject_id': self.class_subject_id,
            'teacher_name': self.class_subject.teacher.full_name if self.class_subject and self.class_subject.teacher else None,
            'room': self.class_subject.room if self.class_subject else None,
            'enrollment_date': self.enrollment_date.isoformat(),
            'academic_year': self.academic_year,
            'semester': self.semester,
            'current_grade': self.current_grade,
            'class_average': self.class_average,
            'attendance_percentage': self.attendance_percentage,
            'assignments_submitted': self.assignments_submitted,
            'assignments_pending': self.assignments_pending,
            'assignments_graded': self.assignments_graded,
            'topics_completed': self.topics_completed,
            'next_class': self.next_class.isoformat() if self.next_class else None,
            'trend': self.trend,
            'improvement_percentage': self.improvement_percentage,
            'recent_scores': self.recent_scores,
            'is_active': self.is_active,
            'dropped_date': self.dropped_date.isoformat() if self.dropped_date else None,
            'drop_reason': self.drop_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CourseTopic(db.Model):
    __tablename__ = 'subject_topics'  # Keep table name for database compatibility
    
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Curriculum Details
    uneb_topic_code = Column(String(50))
    order_sequence = Column(Integer, default=1)
    estimated_hours = Column(Integer, default=4)
    
    # Prerequisites
    prerequisite_topics = Column(JSON)  # List of prerequisite topic IDs
    
    # Resources
    learning_objectives = Column(JSON)  # List of learning objectives
    teaching_resources = Column(JSON)  # List of teaching resources
    assessment_methods = Column(JSON)  # List of assessment methods
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    course = relationship('Course', foreign_keys=[subject_id], backref='topics')
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.subject_id,
            'name': self.name,
            'description': self.description,
            'uneb_topic_code': self.uneb_topic_code,
            'order_sequence': self.order_sequence,
            'estimated_hours': self.estimated_hours,
            'prerequisite_topics': self.prerequisite_topics,
            'learning_objectives': self.learning_objectives,
            'teaching_resources': self.teaching_resources,
            'assessment_methods': self.assessment_methods,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

