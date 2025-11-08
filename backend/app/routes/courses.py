from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.course_service import CourseService
from app.utils.decorators import role_required

courses_bp = Blueprint('courses', __name__)
course_service = CourseService()

@courses_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required(['admin', 'teacher'])
def create_course():
    """Create a new course"""
    try:
        current_user_id = get_jwt_identity()
        course_data = request.get_json()
        
        result = course_service.create_course(course_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/assign-to-class', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def assign_course_to_class():
    """Assign course to class with teacher"""
    try:
        assignment_data = request.get_json()
        
        result = course_service.assign_course_to_class(assignment_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/enroll-student', methods=['POST'])
@jwt_required()
@role_required(['admin', 'teacher'])
def enroll_student_in_course():
    """Enroll student in course"""
    try:
        enrollment_data = request.get_json()
        
        result = course_service.enroll_student_in_course(enrollment_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_courses(student_id):
    """Get courses for a student"""
    try:
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 1')
        
        courses = course_service.get_student_courses(student_id, academic_year, semester)
        
        return jsonify({
            'success': True,
            'courses': courses
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/students/<int:student_id>/courses', methods=['GET'])
@jwt_required()
def get_student_courses_alt(student_id):
    """Get courses for a student (alternative endpoint for frontend compatibility)"""
    try:
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 1')
        
        courses = course_service.get_student_courses(student_id, academic_year, semester)
        
        return jsonify({
            'success': True,
            'courses': courses
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/teacher/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_courses(teacher_id):
    """Get courses taught by teacher"""
    try:
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 1')
        
        courses = course_service.get_teacher_courses(teacher_id, academic_year, semester)
        
        return jsonify({
            'success': True,
            'courses': courses
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/<int:course_id>/analytics', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_course_analytics(course_id):
    """Get course analytics"""
    try:
        class_id = request.args.get('class_id', type=int)
        
        result = course_service.get_course_analytics(course_id, class_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/student/<int:student_id>/course/<int:course_id>/progress', methods=['PUT'])
@jwt_required()
def update_course_progress(student_id, course_id):
    """Update student progress in course topics"""
    try:
        topic_progress = request.get_json()
        
        result = course_service.update_course_progress(student_id, course_id, topic_progress)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_courses():
    """Get all courses"""
    try:
        class_level = request.args.get('class_level')
        department = request.args.get('department')
        
        courses = course_service.get_all_courses(class_level, department)
        
        return jsonify({
            'success': True,
            'courses': courses
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@courses_bp.route('/enroll-with-payment', methods=['POST'])
@jwt_required()
def enroll_with_payment():
    """Enroll student in course with payment"""
    try:
        from app.services.payment_gateways import PaymentGatewayService
        from app.models.payment import Payment
        from datetime import datetime
        
        current_user_identity = get_jwt_identity()
        # Handle both dict and int identity formats
        if isinstance(current_user_identity, dict):
            current_user_id = current_user_identity.get('id')
        else:
            current_user_id = current_user_identity
            
        if not current_user_id:
            return jsonify({'success': False, 'error': 'User ID not found in token'}), 401
            
        data = request.get_json()
        
        course_id = data.get('course_id')
        course_name = data.get('course_name')
        amount = data.get('amount', 0)
        payment_method = data.get('payment_method', 'stripe')
        
        if not course_id:
            return jsonify({'success': False, 'error': 'Course ID is required'}), 400
        
        # If course is free (amount is 0), enroll directly
        if amount <= 0:
            # Free enrollment
            enrollment_data = {
                'student_id': current_user_id,
                'subject_id': course_id,
                'academic_year': '2024',
                'semester': 'Semester 1'
            }
            result = course_service.enroll_student_in_course(enrollment_data)
            return jsonify(result), 200 if result['success'] else 400
        
        # For paid courses, create payment and enroll after payment
        payment_service = PaymentGatewayService()
        
        # Extract numeric amount from string if needed
        if isinstance(amount, str):
            import re
            amount = float(re.sub(r'[^\d.]', '', amount)) if amount else 0
        
        payment_result = payment_service.initiate_payment(
            user_id=current_user_id,
            amount=amount,
            method=payment_method,
            student_id=current_user_id,
            fee_type='course_enrollment',
            description=f'Course Enrollment: {course_name or f"Course {course_id}"}',
            course_id=course_id
        )
        
        if not payment_result.get('success'):
            return jsonify({
                'success': False,
                'error': payment_result.get('message', 'Payment initiation failed')
            }), 400
        
        # For stripe payments, process payment and enroll immediately
        # For other methods, enrollment happens via webhook
        if payment_method == 'stripe':
            # Process stripe payment (simulated for demo)
            payment = Payment.query.get(payment_result['payment_id'])
            if payment:
                # For demo: mark as completed immediately
                # In production, this would happen via Stripe webhook
                payment.status = 'completed'
                payment.completed_at = datetime.utcnow()
                db.session.commit()
                
                # Enroll student after successful payment
                enrollment_data = {
                    'student_id': current_user_id,
                    'subject_id': course_id,
                    'academic_year': '2024',
                    'semester': 'Semester 1'
                }
                enrollment_result = course_service.enroll_student_in_course(enrollment_data)
                
                if enrollment_result['success']:
                    return jsonify({
                        'success': True,
                        'payment_id': payment_result['payment_id'],
                        'enrollment': enrollment_result,
                        'message': 'Payment successful and course enrollment completed'
                    }), 200
        
        return jsonify({
            'success': True,
            'payment_id': payment_result['payment_id'],
            'payment_status': 'processing',
            'message': 'Payment initiated. Enrollment will be completed after payment confirmation.',
            'payment_url': payment_result.get('payment_url'),
            'instructions': payment_result.get('instructions')
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500