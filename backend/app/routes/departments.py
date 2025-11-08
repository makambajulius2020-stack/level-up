from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app import db
from app.utils.decorators import admin_required, get_current_user_id
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

departments_bp = Blueprint('departments', __name__)

# Department data with role-based access
DEPARTMENTS_DATA = {
    1: {
        'id': 1,
        'name': 'Administration Department',
        'icon': 'Building2',
        'color': 'bg-blue-500',
        'bgColor': 'bg-blue-50',
        'borderColor': 'border-blue-200',
        'textColor': 'text-blue-600',
        'description': 'Central management and oversight of all school operations',
        'systemAccess': 'Admin Dashboard',
        'coreFunctions': [
            'Manage user accounts (students, teachers, parents, staff)',
            'Oversee daily school operations and timetables',
            'Manage departments and organizational structure',
            'System-wide analytics and reporting'
        ],
        'aiFeatures': [
            'Predictive analytics for operational trends',
            'Automated workflow optimization',
            'Smart resource allocation recommendations'
        ],
        'status': 'active',
        'staffCount': 8,
        'lastActivity': '2 hours ago',
        'allowedRoles': ['admin'],
        'editPermissions': ['admin']
    },
    2: {
        'id': 2,
        'name': 'Finance & Accounts Department',
        'icon': 'BarChart3',
        'color': 'bg-green-500',
        'bgColor': 'bg-green-50',
        'borderColor': 'border-green-200',
        'textColor': 'text-green-600',
        'description': 'Financial management, payments, and revenue tracking',
        'systemAccess': 'Finance Dashboard',
        'coreFunctions': [
            'Record and monitor fee payments via Stripe and local banks',
            'Generate receipts, invoices, and termly balances',
            'View real-time revenue dashboards',
            'Manage scholarships, discounts, and arrears'
        ],
        'aiFeatures': [
            'Automated fee reminders to parents',
            'AI-driven financial forecasting and budgeting',
            'Fraud and duplicate transaction detection'
        ],
        'status': 'active',
        'staffCount': 5,
        'lastActivity': '1 hour ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin']
    },
    3: {
        'id': 3,
        'name': 'Academic Departments',
        'icon': 'GraduationCap',
        'color': 'bg-purple-500',
        'bgColor': 'bg-purple-50',
        'borderColor': 'border-purple-200',
        'textColor': 'text-purple-600',
        'description': 'Sciences, Humanities, Business, ICT, and other academic areas',
        'systemAccess': 'Teacher & Department Head Dashboards',
        'coreFunctions': [
            'Manage course timetables, lessons, and assessments',
            'Record student grades and generate report cards',
            'Upload digital resources (notes, past papers, video lessons)',
            'Coordinate inter-departmental academic activities'
        ],
        'aiFeatures': [
            'Smart grading assistance',
            'Performance prediction models for each course',
            'Adaptive learning recommendations for students',
            'AI plagiarism detection for student submissions'
        ],
        'status': 'active',
        'staffCount': 45,
        'lastActivity': '30 minutes ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin', 'teacher']
    },
    4: {
        'id': 4,
        'name': 'Examinations & Assessment Department',
        'icon': 'FileText',
        'color': 'bg-orange-500',
        'bgColor': 'bg-orange-50',
        'borderColor': 'border-orange-200',
        'textColor': 'text-orange-600',
        'description': 'Comprehensive exam management and assessment systems',
        'systemAccess': 'Examination Dashboard',
        'coreFunctions': [
            'Schedule and manage exams (both in-school and online)',
            'Generate UNEB-style reports and analytics',
            'Manage online AI-proctored tests for sick students',
            'Track overall performance by class, course, and semester'
        ],
        'aiFeatures': [
            'Proctoring via webcam + AI (face, sound, eye movement detection)',
            'Automated marking for objective exams',
            'Cheating pattern detection and flagging',
            'Predictive analytics for student improvement strategies'
        ],
        'status': 'active',
        'staffCount': 6,
        'lastActivity': '45 minutes ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin']
    },
    5: {
        'id': 5,
        'name': 'ICT & Data Management Department',
        'icon': 'Monitor',
        'color': 'bg-indigo-500',
        'bgColor': 'bg-indigo-50',
        'borderColor': 'border-indigo-200',
        'textColor': 'text-indigo-600',
        'description': 'Digital systems, databases, and technology infrastructure',
        'systemAccess': 'System Management Dashboard',
        'coreFunctions': [
            'Manage all digital systems (biometrics, databases, network)',
            'Oversee Supabase database, authentication, and backups',
            'Maintain AI integrations (n8n, automation pipelines, chatbots)',
            'Maintain and update school website and e-learning portal'
        ],
        'aiFeatures': [
            'AI-driven anomaly detection (unauthorized access or data corruption)',
            'Smart system optimization reports',
            'Predictive maintenance alerts for hardware (RFID & biometric devices)'
        ],
        'status': 'active',
        'staffCount': 4,
        'lastActivity': '15 minutes ago',
        'allowedRoles': ['admin'],
        'editPermissions': ['admin']
    },
    6: {
        'id': 6,
        'name': 'Human Resource Department',
        'icon': 'UserCheck',
        'color': 'bg-pink-500',
        'bgColor': 'bg-pink-50',
        'borderColor': 'border-pink-200',
        'textColor': 'text-pink-600',
        'description': 'Staff management, payroll, and human resource operations',
        'systemAccess': 'HR & Staff Dashboard',
        'coreFunctions': [
            'Manage teacher and non-teaching staff records',
            'Track biometric attendance and punctuality',
            'Handle staff payroll and leave management',
            'Generate staff performance reports'
        ],
        'aiFeatures': [
            'Staff performance prediction and evaluation metrics',
            'AI-based absenteeism pattern detection',
            'Smart scheduling for duty rosters'
        ],
        'status': 'active',
        'staffCount': 3,
        'lastActivity': '1 hour ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin']
    },
    7: {
        'id': 7,
        'name': 'Laboratory & Science Resource Department',
        'icon': 'FlaskConical',
        'color': 'bg-cyan-500',
        'bgColor': 'bg-cyan-50',
        'borderColor': 'border-cyan-200',
        'textColor': 'text-cyan-600',
        'description': 'Science equipment, resources, and practical learning support',
        'systemAccess': 'Resource & Inventory Dashboard',
        'coreFunctions': [
            'Manage laboratory equipment and chemical inventory',
            'Record student practical marks and resource usage',
            'Request materials from procurement',
            'Maintain safety protocols and equipment standards'
        ],
        'aiFeatures': [
            'Smart stock management (AI forecasts supply needs)',
            'Resource utilization analytics',
            'Predictive maintenance for laboratory equipment'
        ],
        'status': 'active',
        'staffCount': 4,
        'lastActivity': '2 hours ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin', 'teacher']
    },
    8: {
        'id': 8,
        'name': 'Guidance & Counseling Department',
        'icon': 'Heart',
        'color': 'bg-red-500',
        'bgColor': 'bg-red-50',
        'borderColor': 'border-red-200',
        'textColor': 'text-red-600',
        'description': 'Student welfare, counseling, and behavioral support',
        'systemAccess': 'Counseling Dashboard',
        'coreFunctions': [
            'Record student counseling sessions and mentorship programs',
            'Monitor discipline cases and follow-ups',
            'Generate reports on student behavior and well-being',
            'Coordinate with parents and external counselors'
        ],
        'aiFeatures': [
            'AI sentiment analysis from student feedback forms',
            'Predictive behavior risk assessment',
            'Smart recommendation for intervention programs'
        ],
        'status': 'active',
        'staffCount': 3,
        'lastActivity': '3 hours ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin', 'teacher']
    },
    9: {
        'id': 9,
        'name': 'Games & Sports Department',
        'icon': 'Activity',
        'color': 'bg-yellow-500',
        'bgColor': 'bg-yellow-50',
        'borderColor': 'border-yellow-200',
        'textColor': 'text-yellow-600',
        'description': 'Sports activities, physical education, and athletic programs',
        'systemAccess': 'Co-Curricular Dashboard',
        'coreFunctions': [
            'Manage sports activities, team selection, and tournaments',
            'Track student participation and achievements',
            'Schedule inter-school events',
            'Maintain sports equipment and facilities'
        ],
        'aiFeatures': [
            'AI performance analytics for athletes',
            'Attendance and participation pattern insights',
            'Injury risk prediction and prevention'
        ],
        'status': 'active',
        'staffCount': 5,
        'lastActivity': '4 hours ago',
        'allowedRoles': ['admin', 'teacher', 'student'],
        'editPermissions': ['admin', 'teacher']
    },
    12: {
        'id': 12,
        'name': 'Catering & Nutrition Department',
        'icon': 'Utensils',
        'color': 'bg-amber-500',
        'bgColor': 'bg-amber-50',
        'borderColor': 'border-amber-200',
        'textColor': 'text-amber-600',
        'description': 'Food services, nutrition planning, and meal management',
        'systemAccess': 'Catering Dashboard',
        'coreFunctions': [
            'Manage meal plans and dietary requirements',
            'Track food stock levels and supplier deliveries',
            'Generate daily meal reports',
            'Ensure food safety and quality standards'
        ],
        'aiFeatures': [
            'Predict stock depletion and reorder levels',
            'AI optimization of meal plans for budget and nutrition balance',
            'Allergy risk management and dietary recommendations'
        ],
        'status': 'active',
        'staffCount': 6,
        'lastActivity': '2 hours ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin']
    },
    13: {
        'id': 13,
        'name': 'Security Department',
        'icon': 'Shield',
        'color': 'bg-gray-500',
        'bgColor': 'bg-gray-50',
        'borderColor': 'border-gray-200',
        'textColor': 'text-gray-600',
        'description': 'Campus security, access control, and safety management',
        'systemAccess': 'Security Dashboard',
        'coreFunctions': [
            'Monitor gate access (RFID student entry/exit logs)',
            'Manage security guards\' shifts and biometric attendance',
            'Oversee CCTV feeds and incident logs',
            'Coordinate emergency response procedures'
        ],
        'aiFeatures': [
            'AI anomaly detection in attendance patterns',
            'Automated alerts for unauthorized entry or late exit',
            'Predictive security risk assessment'
        ],
        'status': 'active',
        'staffCount': 12,
        'lastActivity': '5 minutes ago',
        'allowedRoles': ['admin'],
        'editPermissions': ['admin']
    },
    14: {
        'id': 14,
        'name': 'Public Relations & Media Department',
        'icon': 'Globe',
        'color': 'bg-violet-500',
        'bgColor': 'bg-violet-50',
        'borderColor': 'border-violet-200',
        'textColor': 'text-violet-600',
        'description': 'Communication, media management, and public relations',
        'systemAccess': 'Website & Media Dashboard',
        'coreFunctions': [
            'Manage school website updates, media posts, and newsletters',
            'Review and publish uploaded videos and lecture materials',
            'Track website analytics and student engagement',
            'Coordinate with external media and community relations'
        ],
        'aiFeatures': [
            'AI content recommendation engine for top-rated videos',
            'Automated keyword tagging and content classification',
            'Monetization analytics and ad placement optimization'
        ],
        'status': 'active',
        'staffCount': 3,
        'lastActivity': '6 hours ago',
        'allowedRoles': ['admin', 'teacher'],
        'editPermissions': ['admin', 'teacher']
    },
    15: {
        'id': 15,
        'name': 'Student Affairs & Clubs Department',
        'icon': 'Award',
        'color': 'bg-rose-500',
        'bgColor': 'bg-rose-50',
        'borderColor': 'border-rose-200',
        'textColor': 'text-rose-600',
        'description': 'Student activities, clubs, leadership, and extracurricular programs',
        'systemAccess': 'Student Activities Dashboard',
        'coreFunctions': [
            'Manage student clubs, societies, and events',
            'Record participation and leadership roles',
            'Track student achievements and volunteer activities',
            'Coordinate student government and elections'
        ],
        'aiFeatures': [
            'AI event scheduling and reminders',
            'Smart club performance summaries',
            'Leadership potential identification and development'
        ],
        'status': 'active',
        'staffCount': 4,
        'lastActivity': '3 hours ago',
        'allowedRoles': ['admin', 'teacher', 'student'],
        'editPermissions': ['admin', 'teacher']
    }
}

@departments_bp.route('/', methods=['GET'])
@jwt_required()
def get_departments():
    """Get all departments based on user role"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Filter departments based on user role
        accessible_departments = []
        for dept_id, dept_data in DEPARTMENTS_DATA.items():
            if user.role in dept_data['allowedRoles']:
                # Add user-specific permissions
                dept_with_permissions = dept_data.copy()
                dept_with_permissions['canEdit'] = user.role in dept_data['editPermissions']
                dept_with_permissions['userRole'] = user.role
                accessible_departments.append(dept_with_permissions)
        
        return jsonify({
            'success': True,
            'data': accessible_departments,
            'total': len(accessible_departments),
            'userRole': user.role
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch departments'}), 500

@departments_bp.route('/<int:department_id>', methods=['GET'])
@jwt_required()
def get_department(department_id):
    """Get specific department details"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if department_id not in DEPARTMENTS_DATA:
            return jsonify({'success': False, 'message': 'Department not found'}), 404
        
        dept_data = DEPARTMENTS_DATA[department_id]
        
        # Check if user has access to this department
        if user.role not in dept_data['allowedRoles']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        
        # Add user-specific permissions
        dept_with_permissions = dept_data.copy()
        dept_with_permissions['canEdit'] = user.role in dept_data['editPermissions']
        dept_with_permissions['userRole'] = user.role
        
        return jsonify({
            'success': True,
            'data': dept_with_permissions
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching department {department_id}: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch department'}), 500

@departments_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_department():
    """Create a new department (Admin only)"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'systemAccess']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # Generate new department ID
        new_id = max(DEPARTMENTS_DATA.keys()) + 1 if DEPARTMENTS_DATA else 1
        
        # Create new department
        new_department = {
            'id': new_id,
            'name': data['name'],
            'description': data['description'],
            'icon': data.get('icon', 'Building2'),
            'color': data.get('color', 'bg-blue-500'),
            'bgColor': data.get('bgColor', 'bg-blue-50'),
            'borderColor': data.get('borderColor', 'border-blue-200'),
            'textColor': data.get('textColor', 'text-blue-600'),
            'systemAccess': data['systemAccess'],
            'coreFunctions': data.get('coreFunctions', []),
            'aiFeatures': data.get('aiFeatures', []),
            'status': data.get('status', 'active'),
            'staffCount': data.get('staffCount', 0),
            'lastActivity': 'Just now',
            'allowedRoles': data.get('allowedRoles', ['admin']),
            'editPermissions': data.get('editPermissions', ['admin'])
        }
        
        # Add to departments data
        DEPARTMENTS_DATA[new_id] = new_department
        
        return jsonify({
            'success': True,
            'message': 'Department created successfully',
            'data': new_department
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating department: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create department'}), 500

@departments_bp.route('/<int:department_id>', methods=['PUT'])
@jwt_required()
def update_department(department_id):
    """Update department information"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if department_id not in DEPARTMENTS_DATA:
            return jsonify({'success': False, 'message': 'Department not found'}), 404
        
        dept_data = DEPARTMENTS_DATA[department_id]
        
        # Check if user has edit permissions
        if user.role not in dept_data['editPermissions']:
            return jsonify({'success': False, 'message': 'Insufficient permissions to edit this department'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['name', 'description', 'status', 'staffCount']
        updated_fields = {}
        
        for field in allowed_fields:
            if field in data:
                DEPARTMENTS_DATA[department_id][field] = data[field]
                updated_fields[field] = data[field]
        
        # Update last activity
        DEPARTMENTS_DATA[department_id]['lastActivity'] = 'Just now'
        
        return jsonify({
            'success': True,
            'message': 'Department updated successfully',
            'data': DEPARTMENTS_DATA[department_id],
            'updatedFields': updated_fields
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating department {department_id}: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update department'}), 500

@departments_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_department_stats():
    """Get department statistics"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Calculate stats based on accessible departments
        accessible_departments = []
        total_staff = 0
        ai_enabled_count = 0
        
        for dept_id, dept_data in DEPARTMENTS_DATA.items():
            if user.role in dept_data['allowedRoles']:
                accessible_departments.append(dept_data)
                total_staff += dept_data['staffCount']
                if dept_data['aiFeatures']:
                    ai_enabled_count += 1
        
        stats = {
            'totalDepartments': len(accessible_departments),
            'activeDepartments': len([d for d in accessible_departments if d['status'] == 'active']),
            'totalStaff': total_staff,
            'aiEnabledDepartments': ai_enabled_count,
            'systemHealth': 98.5,
            'userRole': user.role
        }
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching department stats: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch department statistics'}), 500

@departments_bp.route('/assign', methods=['POST'])
@jwt_required()
@admin_required
def assign_department_to_user():
    """Assign department access to a user (Admin only)"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        data = request.get_json()
        
        user_id = data.get('user_id')
        department_id = data.get('department_id')
        
        if not user_id or not department_id:
            return jsonify({'success': False, 'message': 'User ID and Department ID are required'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if department_id not in DEPARTMENTS_DATA:
            return jsonify({'success': False, 'message': 'Department not found'}), 404
        
        # Add user to department's allowed roles if not already present
        dept_data = DEPARTMENTS_DATA[department_id]
        if user.role not in dept_data['allowedRoles']:
            dept_data['allowedRoles'].append(user.role)
        
        return jsonify({
            'success': True,
            'message': f'User {user.first_name} {user.last_name} has been assigned to {dept_data["name"]}',
            'data': {
                'userId': user_id,
                'departmentId': department_id,
                'departmentName': dept_data['name'],
                'userRole': user.role
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error assigning department to user: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to assign department'}), 500

@departments_bp.route('/permissions', methods=['GET'])
@jwt_required()
def get_user_department_permissions():
    """Get user's department permissions"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        permissions = {
            'userRole': user.role,
            'accessibleDepartments': [],
            'editableDepartments': []
        }
        
        for dept_id, dept_data in DEPARTMENTS_DATA.items():
            if user.role in dept_data['allowedRoles']:
                permissions['accessibleDepartments'].append({
                    'id': dept_id,
                    'name': dept_data['name'],
                    'canEdit': user.role in dept_data['editPermissions']
                })
                
                if user.role in dept_data['editPermissions']:
                    permissions['editableDepartments'].append(dept_id)
        
        return jsonify({
            'success': True,
            'data': permissions
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user permissions: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch permissions'}), 500
