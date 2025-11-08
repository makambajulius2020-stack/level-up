from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.exam import Exam, ExamSubmission
from app.models.user import User
from app import db
from datetime import datetime
from sqlalchemy import func

examinations_bp = Blueprint('examinations', __name__)

@examinations_bp.route('/examinations/dashboard', methods=['GET'])
@jwt_required()
def get_examinations_dashboard():
    """Get examinations dashboard data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['teacher', 'admin']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        # Get exam statistics
        query = Exam.query
        if user.role == 'teacher':
            query = query.filter_by(teacher_id=current_user_id)
        
        total_exams = query.count()
        scheduled_exams = query.filter_by(status='scheduled').count()
        completed_exams = query.filter_by(status='completed').count()
        active_exams = query.filter_by(status='active').count()
        
        # Recent exams
        recent_exams = query.order_by(Exam.scheduled_date.desc()).limit(10).all()
        
        # Submission statistics
        submissions = ExamSubmission.query
        if user.role == 'teacher':
            # Get submissions for teacher's exams
            exam_ids = [e.id for e in query.all()]
            submissions = submissions.filter(ExamSubmission.exam_id.in_(exam_ids))
        
        total_submissions = submissions.count()
        graded_submissions = submissions.filter_by(status='graded').count()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'stats': {
                    'total_exams': total_exams,
                    'scheduled_exams': scheduled_exams,
                    'completed_exams': completed_exams,
                    'active_exams': active_exams,
                    'total_submissions': total_submissions,
                    'graded_submissions': graded_submissions
                },
                'recent_exams': [exam.to_dict() for exam in recent_exams]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

