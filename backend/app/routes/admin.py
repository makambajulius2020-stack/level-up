from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app import db
from app.utils.decorators import admin_required
import json
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__)

# Role permissions configuration
ROLE_PERMISSIONS = {
    'student': [
        'View Grades', 'Submit Assignments', 'Access Library', 
        'View Timetable', 'View Attendance', 'View Exams'
    ],
    'teacher': [
        'Manage Classes', 'Grade Assignments', 'Create Lessons', 
        'View Reports', 'Manage Attendance', 'Create Exams',
        'View Student Profiles', 'Manage Timetable'
    ],
    'admin': [
        'Full Access', 'User Management', 'System Settings', 
        'Manage Students', 'Manage Teachers', 
        'View Reports', 'Manage Finances', 'Manage Attendance', 
        'Manage Timetable', 'Manage Exams', 'Manage Classes',
        'Manage Courses', 'Manage Semesters', 'Manage Library',
        'Manage Cocurricular', 'Manage Biometric', 'Manage AI'
    ]
}

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        role = request.args.get('role')
        search = request.args.get('search')
        
        query = User.query
        
        if role and role != 'all':
            query = query.filter_by(role=role)
        
        if search:
            query = query.filter(
                db.or_(
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        users = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch users'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user information"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get_or_404(user_id)
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'email', 'phone', 'address', 'date_of_birth', 'gender']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to update user'}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Update user active status"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get_or_404(user_id)
        user.is_active = data.get('is_active', user.is_active)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User status updated successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user status {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to update user status'}), 500

@admin_bp.route('/roles', methods=['GET'])
@jwt_required()
@admin_required
def get_roles():
    """Get all roles with their permissions"""
    try:
        # Get user counts for each role
        role_counts = {}
        for role in ROLE_PERMISSIONS.keys():
            count = User.query.filter_by(role=role, is_active=True).count()
            role_counts[role] = count
        
        roles_data = []
        for role, permissions in ROLE_PERMISSIONS.items():
            roles_data.append({
                'role': role,
                'count': role_counts.get(role, 0),
                'permissions': permissions
            })
        
        return jsonify({
            'success': True,
            'data': roles_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching roles: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch roles'}), 500

@admin_bp.route('/roles/<role>/permissions', methods=['GET'])
@jwt_required()
@admin_required
def get_role_permissions(role):
    """Get permissions for a specific role"""
    try:
        if role not in ROLE_PERMISSIONS:
            return jsonify({'success': False, 'message': 'Invalid role'}), 400
        
        return jsonify({
            'success': True,
            'data': {
                'role': role,
                'permissions': ROLE_PERMISSIONS[role]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching role permissions: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch role permissions'}), 500

@admin_bp.route('/roles/<role>/permissions', methods=['PUT'])
@jwt_required()
@admin_required
def update_role_permissions(role):
    """Update permissions for a specific role"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if role not in ROLE_PERMISSIONS:
            return jsonify({'success': False, 'message': 'Invalid role'}), 400
        
        new_permissions = data.get('permissions', [])
        
        # Validate permissions (basic validation)
        if not isinstance(new_permissions, list):
            return jsonify({'success': False, 'message': 'Permissions must be a list'}), 400
        
        # Update the role permissions
        ROLE_PERMISSIONS[role] = new_permissions
        
        # In a real application, you would save this to a database
        # For now, we'll just return success
        
        return jsonify({
            'success': True,
            'message': f'Permissions updated successfully for {role}',
            'data': {
                'role': role,
                'permissions': new_permissions
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating role permissions: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update role permissions'}), 500

@admin_bp.route('/permissions', methods=['GET'])
@jwt_required()
@admin_required
def get_available_permissions():
    """Get all available permissions"""
    try:
        # Get all unique permissions from all roles
        all_permissions = set()
        for permissions in ROLE_PERMISSIONS.values():
            all_permissions.update(permissions)
        
        return jsonify({
            'success': True,
            'data': sorted(list(all_permissions))
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching available permissions: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch available permissions'}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_dashboard():
    """Get admin dashboard data"""
    try:
        from app.models.grade import Grade
        from app.models.attendance import Attendance
        from app.models.payment import Payment
        from app.models.online_class import OnlineClass
        from datetime import datetime, timedelta
        from sqlalchemy import func
        
        # Get statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_teachers = User.query.filter_by(role='teacher').count()
        total_admins = User.query.filter_by(role='admin').count()
        
        # Recent activity
        recent_payments = Payment.query.order_by(Payment.created_at.desc()).limit(10).all()
        recent_classes = OnlineClass.query.order_by(OnlineClass.created_at.desc()).limit(10).all()
        
        # Attendance stats
        today = datetime.utcnow().date()
        today_attendance = Attendance.query.filter(
            func.date(Attendance.date) == today
        ).count()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'stats': {
                    'total_users': total_users,
                    'total_students': total_students,
                    'total_teachers': total_teachers,
                    'total_admins': total_admins,
                    'today_attendance': today_attendance
                },
                'recent_payments': [p.to_dict() if hasattr(p, 'to_dict') else {
                    'id': p.id,
                    'amount': float(p.amount),
                    'status': p.status,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                } for p in recent_payments],
                'recent_classes': [c.to_dict() for c in recent_classes]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching admin dashboard: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch dashboard data'}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        stats = {
            'total_users': User.query.count(),
            'active_users': User.query.filter_by(is_active=True).count() if hasattr(User, 'is_active') else User.query.count(),
            'role_counts': {}
        }
        
        for role in ROLE_PERMISSIONS.keys():
            stats['role_counts'][role] = User.query.filter_by(role=role, is_active=True).count()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching admin stats: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch admin statistics'}), 500
