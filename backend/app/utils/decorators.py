from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def get_current_user_id():
    """Safely extract user ID from JWT identity"""
    try:
        identity = get_jwt_identity()
        if isinstance(identity, dict):
            return identity.get('id')
        elif isinstance(identity, int):
            return identity
        else:
            return None
    except Exception:
        return None

def role_required(allowed_roles):
    """
    Decorator to check if user has required role
    
    Args:
        allowed_roles: List of allowed roles ['admin', 'teacher', 'student']
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                current_user = get_jwt_identity()
                # Handle both dict and int formats
                if isinstance(current_user, dict):
                    current_user_id = current_user.get('id')
                else:
                    current_user_id = current_user
                
                if not current_user_id:
                    return jsonify({'success': False, 'error': 'User not found'}), 404
                
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({'success': False, 'error': 'User not found'}), 404
                
                if user.role not in allowed_roles:
                    return jsonify({
                        'success': False, 
                        'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                    }), 403
                
                return f(*args, **kwargs)
                
            except (KeyError, TypeError) as e:
                return jsonify({'success': False, 'error': 'Invalid authentication token'}), 401
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500
                
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require admin role"""
    return role_required(['admin'])(f)

def teacher_required(f):
    """Decorator to require teacher role"""
    return role_required(['teacher', 'admin'])(f)

def student_required(f):
    """Decorator to require student role"""
    return role_required(['student'])(f)

