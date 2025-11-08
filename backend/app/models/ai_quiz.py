from app import db
from datetime import datetime
import json

class AIStudyQuiz(db.Model):
    """AI-generated quizzes for study timetable"""
    __tablename__ = 'ai_study_quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    difficulty_level = db.Column(db.String(20), default='medium')
    quiz_type = db.Column(db.String(30), default='multiple_choice')
    total_questions = db.Column(db.Integer, nullable=False)
    time_limit_minutes = db.Column(db.Integer, default=30)
    quiz_data = db.Column(db.JSON)
    scheduled_date = db.Column(db.Date)
    scheduled_time = db.Column(db.Time)
    status = db.Column(db.String(20), default='scheduled')
    score = db.Column(db.Numeric(5, 2))
    max_score = db.Column(db.Numeric(5, 2), nullable=False)
    percentage = db.Column(db.Numeric(5, 2))
    time_taken_minutes = db.Column(db.Integer)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    answers = db.Column(db.JSON)
    feedback = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = db.relationship('User', foreign_keys=[student_id], backref='quizzes')
    questions = db.relationship('QuizQuestion', backref='quiz', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<AIStudyQuiz {self.subject} - {self.topic}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'subject': self.subject,
            'topic': self.topic,
            'difficulty_level': self.difficulty_level,
            'quiz_type': self.quiz_type,
            'total_questions': self.total_questions,
            'time_limit_minutes': self.time_limit_minutes,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'status': self.status,
            'score': float(self.score) if self.score else None,
            'max_score': float(self.max_score) if self.max_score else None,
            'percentage': float(self.percentage) if self.percentage else None,
            'time_taken_minutes': self.time_taken_minutes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class QuizQuestion(db.Model):
    """Individual quiz questions"""
    __tablename__ = 'quiz_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('ai_study_quizzes.id'), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), nullable=False)
    options = db.Column(db.JSON)
    correct_answer = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, default=1)
    explanation = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<QuizQuestion {self.quiz_id}-{self.question_number}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'points': self.points,
            'explanation': self.explanation,
            'difficulty': self.difficulty
        }
