from datetime import datetime
from app import db
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Exam(db.Model):
    __tablename__ = 'exams'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Exam Configuration
    exam_type = Column(String(50), nullable=False)  # multiple-choice, essay, mixed, practical
    duration_minutes = Column(Integer, nullable=False)
    total_marks = Column(Float, default=100.0)
    difficulty_level = Column(String(20), default='medium')  # easy, medium, hard, mixed
    
    # AI Configuration
    ai_generated = Column(Boolean, default=False)
    ai_topics = Column(Text)  # JSON string of topics for AI generation
    question_count = Column(Integer, default=0)
    
    # Scheduling
    scheduled_date = Column(DateTime)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    
    # Status and Settings
    status = Column(String(20), default='draft')  # draft, scheduled, active, completed, graded
    instructions = Column(Text)
    allow_calculator = Column(Boolean, default=False)
    randomize_questions = Column(Boolean, default=True)
    show_results_immediately = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    course = relationship('Course', backref='exams')
    class_ref = relationship('SchoolClass', backref='exams')
    teacher = relationship('User', foreign_keys=[teacher_id], backref='created_exams')
    creator = relationship('User', foreign_keys=[created_by], backref='authored_exams')
    questions = relationship('ExamQuestion', backref='exam', cascade='all, delete-orphan')
    submissions = relationship('ExamSubmission', backref='exam', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'class_id': self.class_id,
            'class_name': self.class_ref.name if self.class_ref else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'exam_type': self.exam_type,
            'duration_minutes': self.duration_minutes,
            'total_marks': self.total_marks,
            'difficulty_level': self.difficulty_level,
            'ai_generated': self.ai_generated,
            'question_count': self.question_count,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'instructions': self.instructions,
            'allow_calculator': self.allow_calculator,
            'randomize_questions': self.randomize_questions,
            'show_results_immediately': self.show_results_immediately,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ExamQuestion(db.Model):
    __tablename__ = 'exam_questions'
    
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # multiple-choice, essay, short-answer, true-false
    marks = Column(Float, nullable=False)
    
    # Multiple Choice Options (JSON)
    options = Column(JSON)  # For multiple choice questions
    correct_answer = Column(Text)  # Correct answer or answer key
    explanation = Column(Text)  # Explanation for the answer
    
    # AI Generation Info
    ai_generated = Column(Boolean, default=False)
    difficulty = Column(String(20), default='medium')
    topic = Column(String(200))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exam_id': self.exam_id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'marks': self.marks,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'ai_generated': self.ai_generated,
            'difficulty': self.difficulty,
            'topic': self.topic,
            'created_at': self.created_at.isoformat()
        }

class ExamSubmission(db.Model):
    __tablename__ = 'exam_submissions'
    
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Submission Data
    answers = Column(JSON)  # Student's answers
    score = Column(Float)
    percentage = Column(Float)
    grade = Column(String(5))  # A, B, C, D, F
    
    # Timing
    started_at = Column(DateTime)
    submitted_at = Column(DateTime)
    time_taken_minutes = Column(Integer)
    
    # Status
    status = Column(String(20), default='in_progress')  # in_progress, submitted, graded
    auto_graded = Column(Boolean, default=False)
    graded_by = Column(Integer, ForeignKey('user.id'))
    graded_at = Column(DateTime)
    
    # Feedback
    feedback = Column(Text)
    teacher_comments = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', foreign_keys=[student_id], backref='exam_submissions')
    grader = relationship('User', foreign_keys=[graded_by], backref='graded_submissions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'exam_id': self.exam_id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'answers': self.answers,
            'score': self.score,
            'percentage': self.percentage,
            'grade': self.grade,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'time_taken_minutes': self.time_taken_minutes,
            'status': self.status,
            'auto_graded': self.auto_graded,
            'graded_by': self.graded_by,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
            'feedback': self.feedback,
            'teacher_comments': self.teacher_comments,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ExamTemplate(db.Model):
    __tablename__ = 'exam_templates'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    class_level = Column(String(10), nullable=False)  # S4, S5, S6
    
    # Template Configuration
    exam_type = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    total_marks = Column(Float, default=100.0)
    difficulty_level = Column(String(20), default='medium')
    question_count = Column(Integer, nullable=False)
    
    # Template Data
    template_data = Column(JSON)  # Template structure and questions
    description = Column(Text)
    tags = Column(String(500))  # Comma-separated tags
    
    # Usage Stats
    usage_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    is_public = Column(Boolean, default=True)
    
    # Relationships
    course = relationship('Course', backref='exam_templates')
    creator = relationship('User', backref='created_templates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'class_level': self.class_level,
            'exam_type': self.exam_type,
            'duration_minutes': self.duration_minutes,
            'total_marks': self.total_marks,
            'difficulty_level': self.difficulty_level,
            'question_count': self.question_count,
            'description': self.description,
            'tags': self.tags.split(',') if self.tags else [],
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat(),
            'is_public': self.is_public
        }
