from flask import Blueprint, request, jsonify
from app.models.user import User
from app import db
from passlib.hash import pbkdf2_sha256 as sha256
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

def detect_role_from_email(email):
    """Auto-detect user role based on email pattern"""
    if email.endswith('.admin@gmail.com'):
        return 'admin'
    elif email.endswith('.teacher@gmail.com'):
        return 'teacher'
    elif email.endswith('.student@gmail.com'):
        return 'student'
    else:
        return 'student'  # Default to student for regular emails

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'No data provided', 'error': 'Missing request body'}), 400
        
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        
        if not email or not name or not password:
            return jsonify({'msg': 'Missing required fields', 'error': 'Email, name, and password are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'msg': 'User already exists', 'error': 'A user with this email already exists'}), 409
        
        # Auto-detect role from email if not explicitly provided
        role = data.get('role') or detect_role_from_email(email)
        
        # Create new user
        try:
            user = User(
                name=name,
                email=email,
                role=role,
                password_hash=sha256.hash(password)
            )
            db.session.add(user)
            db.session.commit()
            return jsonify({'msg': 'User registered successfully', 'role': role, 'user_id': user.id}), 201
        except Exception as db_error:
            db.session.rollback()
            import traceback
            error_details = str(db_error)
            # Log full traceback for debugging
            print(f"Database error during registration: {error_details}")
            print(traceback.format_exc())
            return jsonify({
                'msg': 'Registration failed', 
                'error': error_details,
                'details': 'Database operation failed. Please check if database tables are created.'
            }), 500
    except Exception as e:
        db.session.rollback()
        import traceback
        error_details = str(e)
        print(f"Registration error: {error_details}")
        print(traceback.format_exc())
        return jsonify({
            'msg': 'Registration failed', 
            'error': error_details
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'No data provided', 'error': 'Missing request body'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'msg': 'Missing credentials', 'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if user and sha256.verify(password, user.password_hash):
            access_token = create_access_token(identity={'id': user.id, 'role': user.role})
            return jsonify({'access_token': access_token, 'user': user.to_dict()})
        return jsonify({'msg': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'msg': 'Login failed', 'error': str(e)}), 500
