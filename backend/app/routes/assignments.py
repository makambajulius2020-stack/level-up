from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.models.user import User
from app.services.assignment_service import AssignmentService
from app.utils.decorators import get_current_user_id

assignments_bp = Blueprint('assignments', __name__)

# Initialize assignment service
assignment_service = AssignmentService()

@assignments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    """Create a new assignment"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'subject', 'class_level', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Parse due date
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid due_date format. Use ISO 8601 format.'
            }), 400
        
        result = assignment_service.create_assignment(
            teacher_id=teacher_id,
            title=data['title'],
            description=data.get('description', ''),
            subject=data['subject'],
            class_level=data['class_level'],
            due_date=due_date,
            max_marks=data.get('max_marks', 100),
            submission_format=data.get('submission_format', 'pdf'),
            plagiarism_check=data.get('plagiarism_check', True),
            ai_grading=data.get('ai_grading', False)
        )
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error creating assignment',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>/publish', methods=['POST'])
@jwt_required()
def publish_assignment(assignment_id):
    """Publish assignment to students"""
    try:
        teacher_id = get_jwt_identity()['id']
        result = assignment_service.publish_assignment(assignment_id, teacher_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error publishing assignment',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    """Submit assignment by student"""
    try:
        student_id = get_jwt_identity()['id']
        
        # Check if it's a file upload or text submission
        if 'file' in request.files:
            file = request.files['file']
            submission_text = request.form.get('submission_text')
        else:
            file = None
            data = request.get_json()
            submission_text = data.get('submission_text') if data else None
        
        if not submission_text and not file:
            return jsonify({
                'success': False,
                'message': 'Either submission text or file is required'
            }), 400
        
        result = assignment_service.submit_assignment(
            assignment_id=assignment_id,
            student_id=student_id,
            submission_text=submission_text,
            file=file
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error submitting assignment',
            'error': str(e)
        }), 500

@assignments_bp.route('/submissions/<int:submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission(submission_id):
    """Grade assignment submission"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['marks', 'grade', 'feedback']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = assignment_service.grade_assignment(
            submission_id=submission_id,
            teacher_id=teacher_id,
            marks=data['marks'],
            grade=data['grade'],
            feedback=data['feedback']
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error grading assignment',
            'error': str(e)
        }), 500

@assignments_bp.route('/teacher', methods=['GET'])
@jwt_required()
def get_teacher_assignments():
    """Get assignments created by teacher"""
    try:
        teacher_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = assignment_service.get_teacher_assignments(teacher_id, page, per_page)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching teacher assignments',
            'error': str(e)
        }), 500

@assignments_bp.route('/student', methods=['GET'])
@jwt_required()
def get_student_assignments():
    """Get assignments for student"""
    try:
        student_id = get_current_user_id()
        if not student_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        
        # Get student's class level from profile
        from app.models.profile import UserProfile
        profile = UserProfile.query.filter_by(user_id=student_id).first()
        if not profile or not profile.class_level:
            return jsonify({
                'success': False,
                'message': 'Student class level not found in profile'
            }), 400
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = assignment_service.get_student_assignments(
            student_id, profile.class_level, page, per_page
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching student assignments',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_assignment_submissions(assignment_id):
    """Get submissions for an assignment"""
    try:
        teacher_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = assignment_service.get_assignment_submissions(
            assignment_id, teacher_id, page, per_page
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching assignment submissions',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>/analytics', methods=['GET'])
@jwt_required()
def get_assignment_analytics(assignment_id):
    """Get analytics for an assignment"""
    try:
        teacher_id = get_jwt_identity()['id']
        result = assignment_service.get_assignment_analytics(assignment_id, teacher_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating assignment analytics',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment(assignment_id):
    """Get specific assignment details"""
    try:
        user_id = get_jwt_identity()['id']
        user = User.query.get(user_id)
        
        from app.models.profile import Assignment
        assignment = Assignment.query.get(assignment_id)
        
        if not assignment:
            return jsonify({
                'success': False,
                'message': 'Assignment not found'
            }), 404
        
        # Check authorization
        if user.role == 'teacher' and assignment.teacher_id != user_id:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        assignment_data = assignment.to_dict()
        
        # If student, check if they have submitted
        if user.role == 'student':
            from app.models.assignment import AssignmentSubmission
            submission = AssignmentSubmission.query.filter_by(
                assignment_id=assignment_id,
                student_id=user_id
            ).first()
            
            assignment_data['submitted'] = submission is not None
            if submission:
                assignment_data['submission'] = submission.to_dict()
        
        return jsonify({
            'success': True,
            'assignment': assignment_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching assignment',
            'error': str(e)
        }), 500

@assignments_bp.route('/<int:assignment_id>', methods=['PUT'])
@jwt_required()
def update_assignment(assignment_id):
    """Update assignment details"""
    try:
        teacher_id = get_jwt_identity()['id']
        data = request.get_json()
        
        from app.models.profile import Assignment
        assignment = Assignment.query.filter_by(
            id=assignment_id,
            teacher_id=teacher_id
        ).first()
        
        if not assignment:
            return jsonify({
                'success': False,
                'message': 'Assignment not found'
            }), 404
        
        # Update allowed fields
        updatable_fields = ['title', 'description', 'due_date', 'max_marks']
        
        for field in updatable_fields:
            if field in data:
                if field == 'due_date':
                    try:
                        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                        setattr(assignment, field, due_date)
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'message': 'Invalid due_date format'
                        }), 400
                else:
                    setattr(assignment, field, data[field])
        
        from app import db
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Assignment updated successfully',
            'assignment': assignment.to_dict()
        }), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Error updating assignment',
            'error': str(e)
        }), 500
