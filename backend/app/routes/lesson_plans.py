from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.models.user import User
from app.services.lesson_planning_service import LessonPlanningService

lesson_plans_bp = Blueprint('lesson_plans', __name__)

# Initialize lesson planning service
lesson_planning_service = LessonPlanningService()

@lesson_plans_bp.route('/', methods=['POST'])
@jwt_required()
def create_lesson_plan():
    """Create a new lesson plan"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'subject', 'class_level', 'topic', 'lesson_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Parse lesson date
        try:
            lesson_date = datetime.fromisoformat(data['lesson_date']).date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid lesson_date format. Use YYYY-MM-DD format.'
            }), 400
        
        result = lesson_planning_service.create_lesson_plan(
            teacher_id=teacher_id,
            title=data['title'],
            subject=data['subject'],
            class_level=data['class_level'],
            topic=data['topic'],
            lesson_date=lesson_date,
            duration_minutes=data.get('duration_minutes', 40),
            period_number=data.get('period_number', 1)
        )
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error creating lesson plan',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/<int:lesson_id>', methods=['PUT'])
@jwt_required()
def update_lesson_plan(lesson_id):
    """Update lesson plan content"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        result = lesson_planning_service.update_lesson_plan(lesson_id, teacher_id, data)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error updating lesson plan',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/<int:lesson_id>/complete', methods=['POST'])
@jwt_required()
def complete_lesson(lesson_id):
    """Mark lesson as completed with reflection"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['effectiveness_rating', 'reflection']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate rating
        rating = data['effectiveness_rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({
                'success': False,
                'message': 'Effectiveness rating must be between 1 and 5'
            }), 400
        
        result = lesson_planning_service.complete_lesson(
            lesson_id, teacher_id, rating, data['reflection']
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error completing lesson',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/', methods=['GET'])
@jwt_required()
def get_lesson_plans():
    """Get lesson plans for teacher"""
    try:
        teacher_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        subject = request.args.get('subject')
        class_level = request.args.get('class_level')
        
        result = lesson_planning_service.get_teacher_lesson_plans(
            teacher_id, page, per_page, subject, class_level
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching lesson plans',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/weekly-schedule', methods=['GET'])
@jwt_required()
def get_weekly_schedule():
    """Get weekly lesson schedule"""
    try:
        teacher_id = get_jwt_identity()['id']
        start_date_str = request.args.get('start_date')
        
        if not start_date_str:
            return jsonify({
                'success': False,
                'message': 'start_date is required (YYYY-MM-DD format)'
            }), 400
        
        try:
            start_date = datetime.fromisoformat(start_date_str).date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid start_date format. Use YYYY-MM-DD format.'
            }), 400
        
        result = lesson_planning_service.get_weekly_schedule(teacher_id, start_date)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching weekly schedule',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/scheme-of-work', methods=['GET'])
@jwt_required()
def generate_scheme_of_work():
    """Generate AI-assisted scheme of work"""
    try:
        teacher_id = get_jwt_identity()['id']
        subject = request.args.get('subject')
        class_level = request.args.get('class_level')
        term = request.args.get('term', 'Term 1')
        
        if not subject or not class_level:
            return jsonify({
                'success': False,
                'message': 'subject and class_level are required'
            }), 400
        
        result = lesson_planning_service.generate_scheme_of_work(
            teacher_id, subject, class_level, term
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating scheme of work',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_lesson_analytics():
    """Get lesson planning analytics"""
    try:
        teacher_id = get_jwt_identity()['id']
        subject = request.args.get('subject')
        class_level = request.args.get('class_level')
        
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        start_date = None
        end_date = None
        
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str).date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid start_date format'
                }), 400
        
        if end_date_str:
            try:
                end_date = datetime.fromisoformat(end_date_str).date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid end_date format'
                }), 400
        
        result = lesson_planning_service.get_lesson_analytics(
            teacher_id, subject, class_level, start_date, end_date
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating lesson analytics',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson_plan(lesson_id):
    """Get specific lesson plan"""
    try:
        teacher_id = get_jwt_identity()['id']
        
        from app.models.profile import LessonPlan
        lesson_plan = LessonPlan.query.filter_by(
            id=lesson_id,
            teacher_id=teacher_id
        ).first()
        
        if not lesson_plan:
            return jsonify({
                'success': False,
                'message': 'Lesson plan not found'
            }), 404
        
        return jsonify({
            'success': True,
            'lesson_plan': lesson_plan.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching lesson plan',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/<int:lesson_id>', methods=['DELETE'])
@jwt_required()
def delete_lesson_plan(lesson_id):
    """Delete lesson plan"""
    try:
        teacher_id = get_jwt_identity()['id']
        
        from app.models.profile import LessonPlan
        from app import db
        
        lesson_plan = LessonPlan.query.filter_by(
            id=lesson_id,
            teacher_id=teacher_id
        ).first()
        
        if not lesson_plan:
            return jsonify({
                'success': False,
                'message': 'Lesson plan not found'
            }), 404
        
        db.session.delete(lesson_plan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lesson plan deleted successfully'
        }), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Error deleting lesson plan',
            'error': str(e)
        }), 500

@lesson_plans_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_available_subjects():
    """Get available subjects and class levels for lesson planning"""
    try:
        subjects = lesson_planning_service.uneb_subjects
        
        return jsonify({
            'success': True,
            'subjects': subjects,
            'class_levels': ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
            'competencies': lesson_planning_service.uneb_competencies
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching subjects',
            'error': str(e)
        }), 500
