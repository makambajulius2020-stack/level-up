from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.exam import Exam, ExamQuestion, ExamSubmission
from app.models.user import User
from app import db
from datetime import datetime

tests_bp = Blueprint('tests', __name__)

@tests_bp.route('/tests', methods=['GET'])
@jwt_required()
def get_tests():
    """Get all tests with optional filters"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Get filters
        subject_id = request.args.get('subject_id', type=int)
        class_level = request.args.get('class_level')
        status = request.args.get('status')
        semester = request.args.get('semester')
        
        query = Exam.query
        
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if class_level:
            # Filter by class_id through class relationship
            from app.models.class_management import SchoolClass
            classes = SchoolClass.query.filter_by(level=class_level).all()
            class_ids = [c.id for c in classes]
            if class_ids:
                query = query.filter(Exam.class_id.in_(class_ids))
        if status:
            query = query.filter_by(status=status)
        # Note: Exam model doesn't have semester field, but scheduled_date can be used
        
        # Role-based filtering
        if user.role == 'student':
            # Students can only see available tests
            query = query.filter(
                Exam.status.in_(['scheduled', 'active'])
            )
        elif user.role == 'teacher':
            # Teachers see their own tests
            query = query.filter_by(teacher_id=current_user_id)
        
        tests = query.order_by(Exam.scheduled_date.desc()).all()
        
        return jsonify({
            'success': True,
            'tests': [test.to_dict() for test in tests],
            'total': len(tests)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/student/<int:student_id>/attempts', methods=['GET'])
@jwt_required()
def get_student_test_attempts(student_id):
    """Get all test attempts for a student"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization
        if user.role == 'student' and current_user_id != student_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        attempts = ExamSubmission.query.filter_by(
            student_id=student_id
        ).order_by(ExamSubmission.submitted_at.desc()).all()
        
        return jsonify({
            'success': True,
            'attempts': [{
                'attempt_id': attempt.id,
                'exam_id': attempt.exam_id,
                'exam_title': attempt.exam.title if attempt.exam else 'Unknown',
                'student_id': attempt.student_id,
                'score': attempt.score,
                'percentage': attempt.percentage,
                'status': attempt.status,
                'submitted_at': attempt.submitted_at.isoformat() if attempt.submitted_at else None,
                'started_at': attempt.started_at.isoformat() if attempt.started_at else None
            } for attempt in attempts],
            'total': len(attempts)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test(test_id):
    """Get a specific test by ID"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        test = Exam.query.get(test_id)
        if not test:
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        
        # Check authorization
        if user.role == 'teacher' and test.teacher_id != current_user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        test_data = test.to_dict()
        
        # Include questions if user is teacher or admin
        if user.role in ['teacher', 'admin']:
            questions = ExamQuestion.query.filter_by(exam_id=test_id).all()
            test_data['questions'] = [q.to_dict() for q in questions]
        else:
            # For students, don't include answers
            questions = ExamQuestion.query.filter_by(exam_id=test_id).all()
            test_data['questions'] = [{
                'id': q.id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'points': q.points,
                'options': q.options if q.question_type == 'multiple_choice' else None
            } for q in questions]
        
        return jsonify({
            'success': True,
            'test': test_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/<int:test_id>/start', methods=['POST'])
@jwt_required()
def start_test(test_id):
    """Start a test attempt"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'student':
            return jsonify({'success': False, 'error': 'Only students can start tests'}), 403
        
        test = Exam.query.get(test_id)
        if not test:
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        
        # Check if test is available
        if test.status not in ['scheduled', 'active']:
            return jsonify({'success': False, 'error': 'Test is not available'}), 400
        
        # Check if already started
        existing_attempt = ExamSubmission.query.filter_by(
            exam_id=test_id,
            student_id=current_user_id,
            status='in_progress'
        ).first()
        
        if existing_attempt:
            return jsonify({
                'success': True,
                'attempt_id': existing_attempt.id,
                'message': 'Test already started',
                'attempt': existing_attempt.to_dict()
            }), 200
        
        # Create new attempt
        new_attempt = ExamSubmission(
            exam_id=test_id,
            student_id=current_user_id,
            status='in_progress',
            started_at=datetime.utcnow(),
            answers={}
        )
        
        db.session.add(new_attempt)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'attempt_id': new_attempt.id,
            'message': 'Test started successfully',
            'attempt': new_attempt.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/attempts/<int:attempt_id>/answer', methods=['POST'])
@jwt_required()
def submit_answer(attempt_id):
    """Submit an answer for a test attempt"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'student':
            return jsonify({'success': False, 'error': 'Only students can submit answers'}), 403
        
        attempt = ExamSubmission.query.get(attempt_id)
        if not attempt:
            return jsonify({'success': False, 'error': 'Attempt not found'}), 404
        
        if attempt.student_id != current_user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        if attempt.status != 'in_progress':
            return jsonify({'success': False, 'error': 'Test attempt is not in progress'}), 400
        
        data = request.get_json()
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        if not question_id:
            return jsonify({'success': False, 'error': 'question_id is required'}), 400
        
        # Update answers
        answers = attempt.answers if attempt.answers else {}
        answers[str(question_id)] = answer
        attempt.answers = answers
        attempt.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Answer submitted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/attempts/<int:attempt_id>/submit', methods=['POST'])
@jwt_required()
def submit_test(attempt_id):
    """Submit a completed test attempt"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'student':
            return jsonify({'success': False, 'error': 'Only students can submit tests'}), 403
        
        attempt = ExamSubmission.query.get(attempt_id)
        if not attempt:
            return jsonify({'success': False, 'error': 'Attempt not found'}), 404
        
        if attempt.student_id != current_user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        if attempt.status != 'in_progress':
            return jsonify({'success': False, 'error': 'Test attempt is not in progress'}), 400
        
        # Calculate score
        exam = attempt.exam
        questions = ExamQuestion.query.filter_by(exam_id=exam.id).all()
        answers = attempt.answers if attempt.answers else {}
        
        total_points = sum(q.marks for q in questions)
        earned_points = 0
        
        for question in questions:
            student_answer = answers.get(str(question.id))
            if student_answer and student_answer == question.correct_answer:
                earned_points += question.marks
        
        attempt.score = earned_points
        attempt.percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        attempt.status = 'submitted'
        attempt.submitted_at = datetime.utcnow()
        attempt.graded_at = datetime.utcnow()
        attempt.graded_by = None  # Auto-graded
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Test submitted successfully',
            'attempt': attempt.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tests_bp.route('/tests/attempts/<int:attempt_id>', methods=['GET'])
@jwt_required()
def get_test_attempt(attempt_id):
    """Get a specific test attempt"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        attempt = ExamSubmission.query.get(attempt_id)
        if not attempt:
            return jsonify({'success': False, 'error': 'Attempt not found'}), 404
        
        # Check authorization
        if user.role == 'student' and attempt.student_id != current_user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        attempt_data = attempt.to_dict()
        
        # Include exam details
        if attempt.exam:
            attempt_data['exam'] = attempt.exam.to_dict()
        
        return jsonify({
            'success': True,
            'attempt': attempt_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

