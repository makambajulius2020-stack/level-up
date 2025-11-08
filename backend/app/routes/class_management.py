from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, SchoolClass, Course, StudentEnrollment, ClassSchedule
from app.utils.decorators import admin_required, teacher_required
from datetime import datetime
from sqlalchemy import not_
import logging

logger = logging.getLogger(__name__)

class_management_bp = Blueprint('class_management', __name__)

# Class Management Routes

@class_management_bp.route('/classes', methods=['GET'])
@jwt_required()
def get_classes():
    """Get all classes with optional filtering - Higher institute (adult education) system"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Query parameters
        level = request.args.get('level')
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 3')
        exclude_high_school = request.args.get('exclude_high_school', 'true').lower() == 'true'  # Default: exclude high school
        
        # Build query
        query = SchoolClass.query.filter_by(is_active=True)
        
        # Higher institute system: exclude high school levels (O-Level and A-Level) by default
        # Supported higher institute levels: Year 1, Year 2, Year 3, Year 4, Graduate, Postgraduate
        if exclude_high_school:
            high_school_levels = ['O-Level', 'A-Level']  # Both are high school/secondary education
            query = query.filter(not_(SchoolClass.level.in_(high_school_levels)))
        
        if level:
            query = query.filter_by(level=level)
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
        if semester:
            query = query.filter_by(semester=semester)
            
        # Role-based filtering
        if user.role == 'teacher':
            query = query.filter_by(class_teacher_id=current_user_id)
        
        classes = query.all()
        
        return jsonify({
            'success': True,
            'classes': [cls.to_dict() for cls in classes],
            'total': len(classes)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching classes: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch classes'}), 500

@class_management_bp.route('/classes', methods=['POST'])
@jwt_required()
@admin_required
def create_class():
    """Create a new class"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'code', 'level', 'academic_year', 'semester']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        # Check if class code already exists
        existing_class = SchoolClass.query.filter_by(code=data['code']).first()
        if existing_class:
            return jsonify({'success': False, 'message': 'Class code already exists'}), 400
        
        # Create new class
        new_class = SchoolClass(
            name=data['name'],
            code=data['code'],
            level=data['level'],
            stream=data.get('stream'),
            capacity=data.get('capacity', 40),
            class_teacher_id=data.get('class_teacher_id'),
            room=data.get('room'),
            academic_year=data['academic_year'],
            semester=data['semester']
        )
        
        db.session.add(new_class)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Class created successfully',
            'class': new_class.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating class: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create class'}), 500

@class_management_bp.route('/classes/<int:class_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_class(class_id):
    """Update a class"""
    try:
        class_obj = SchoolClass.query.get_or_404(class_id)
        data = request.get_json()
        
        # Update fields
        for field in ['name', 'code', 'level', 'stream', 'capacity', 'class_teacher_id', 'room']:
            if field in data:
                setattr(class_obj, field, data[field])
        
        class_obj.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Class updated successfully',
            'class': class_obj.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating class: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update class'}), 500

@class_management_bp.route('/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_class(class_id):
    """Delete a class (soft delete)"""
    try:
        class_obj = SchoolClass.query.get_or_404(class_id)
        class_obj.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Class deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting class: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete class'}), 500

# Subject Management Routes

@class_management_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    """Get all courses (legacy endpoint, uses courses)"""
    try:
        level = request.args.get('level')
        
        query = Course.query.filter_by(is_active=True)
        if level:
            query = query.filter_by(class_level=level)
            
        courses = query.all()
        
        return jsonify({
            'success': True,
            'subjects': [course.to_dict() for course in courses],  # Keep 'subjects' key for backward compatibility
            'courses': [course.to_dict() for course in courses]
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch courses'}), 500

@class_management_bp.route('/subjects', methods=['POST'])
@jwt_required()
@admin_required
def create_subject():
    """Create a new course (legacy endpoint, creates courses)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'code']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        # Check if course code already exists
        existing_course = Course.query.filter_by(code=data['code']).first()
        if existing_course:
            return jsonify({'success': False, 'message': 'Course code already exists'}), 400
        
        new_course = Course(
            name=data['name'],
            code=data['code'],
            description=data.get('description'),
            class_level=data.get('level', '')
        )
        
        db.session.add(new_course)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Course created successfully',
            'subject': new_course.to_dict(),  # Keep 'subject' key for backward compatibility
            'course': new_course.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating course: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create course'}), 500

# Student Enrollment Routes

@class_management_bp.route('/classes/<int:class_id>/students', methods=['GET'])
@jwt_required()
def get_class_students(class_id):
    """Get students enrolled in a class"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        class_obj = SchoolClass.query.get_or_404(class_id)
        
        # Check permissions
        if user.role == 'teacher' and class_obj.class_teacher_id != current_user_id:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        
        enrollments = StudentEnrollment.query.filter_by(
            class_id=class_id,
            is_active=True
        ).all()
        
        return jsonify({
            'success': True,
            'students': [enrollment.to_dict() for enrollment in enrollments],
            'class': class_obj.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching class students: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch students'}), 500

@class_management_bp.route('/classes/<int:class_id>/enroll', methods=['POST'])
@jwt_required()
@admin_required
def enroll_student(class_id):
    """Enroll a student in a class"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'success': False, 'message': 'Student ID is required'}), 400
        
        class_obj = SchoolClass.query.get_or_404(class_id)
        student = User.query.filter_by(id=student_id, role='student').first()
        
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
        
        # Check if already enrolled
        existing_enrollment = StudentEnrollment.query.filter_by(
            student_id=student_id,
            class_id=class_id,
            academic_year=class_obj.academic_year,
            semester=class_obj.semester,
            is_active=True
        ).first()
        
        if existing_enrollment:
            return jsonify({'success': False, 'message': 'Student already enrolled in this class'}), 400
        
        # Check class capacity
        if class_obj.student_count >= class_obj.capacity:
            return jsonify({'success': False, 'message': 'Class is at full capacity'}), 400
        
        enrollment = StudentEnrollment(
            student_id=student_id,
            class_id=class_id,
            academic_year=class_obj.academic_year,
            semester=class_obj.semester
        )
        
        db.session.add(enrollment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student enrolled successfully',
            'enrollment': enrollment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error enrolling student: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to enroll student'}), 500

# Class Statistics

@class_management_bp.route('/classes/statistics', methods=['GET'])
@jwt_required()
def get_class_statistics():
    """Get class management statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 3')
        
        # Base query
        classes_query = SchoolClass.query.filter_by(
            academic_year=academic_year,
            semester=semester,
            is_active=True
        )
        
        # Role-based filtering
        if user.role == 'teacher':
            classes_query = classes_query.filter_by(class_teacher_id=current_user_id)
        
        classes = classes_query.all()
        
        # Calculate statistics
        total_classes = len(classes)
        total_students = sum([cls.student_count for cls in classes])
        total_capacity = sum([cls.capacity for cls in classes])
        
        # Calculate average performance and attendance (mock data for now)
        avg_performance = 82.5  # This would come from actual grade calculations
        avg_attendance = 91.2   # This would come from attendance records
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_classes': total_classes,
                'total_students': total_students,
                'total_capacity': total_capacity,
                'utilization_rate': (total_students / total_capacity * 100) if total_capacity > 0 else 0,
                'avg_performance': avg_performance,
                'avg_attendance': avg_attendance
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching class statistics: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch statistics'}), 500
