from flask import Blueprint, request, jsonify
from app.models.attendance import Attendance
from app.models.user import User
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.services.biometric_service import BiometricService
from app.services.workflow_triggers import get_workflow_trigger_service

attendance_bp = Blueprint('attendance', __name__)

# Initialize services
biometric_service = BiometricService()

# RFID route commented out - using biometric attendance instead
# @attendance_bp.route('/rfid', methods=['POST'])
# def rfid_attendance():
#     """Process RFID card scan for student attendance"""
#     # RFID functionality removed - using biometric attendance
#     pass

@attendance_bp.route('/biometric', methods=['POST'])
def biometric_attendance():
    """Process biometric scan for staff attendance"""
    data = request.get_json()
    
    if not data or ('employee_id' not in data and 'biometric_data' not in data):
        return jsonify({
            'success': False, 
            'message': 'Employee ID or biometric data required'
        }), 400
    
    result = biometric_service.process_biometric_scan(
        employee_id=data.get('employee_id'),
        biometric_data=data.get('biometric_data'),
        device_id=data.get('device_id'),
        location=data.get('location')
    )
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@attendance_bp.route('/online', methods=['GET'])
@jwt_required()
def get_online_attendance():
    """Get online class attendance records"""
    try:
        from app.models.online_class import OnlineClassParticipant, OnlineClass
        
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Get date range if provided
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Query online class participants
        query = db.session.query(OnlineClassParticipant, OnlineClass).join(
            OnlineClass, OnlineClassParticipant.class_id == OnlineClass.id
        )
        
        if user.role == 'student':
            query = query.filter(OnlineClassParticipant.student_id == current_user_id)
        elif user.role == 'teacher':
            query = query.filter(OnlineClass.teacher_id == current_user_id)
        
        if start_date:
            query = query.filter(OnlineClassParticipant.joined_at >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(OnlineClassParticipant.joined_at <= datetime.fromisoformat(end_date))
        
        records = query.all()
        
        attendance_records = []
        for participant, online_class in records:
            attendance_records.append({
                'id': participant.id,
                'student_id': participant.student_id,
                'student_name': participant.student.name if participant.student else 'Unknown',
                'class_id': online_class.id,
                'class_name': online_class.title,
                'joined_at': participant.joined_at.isoformat() if participant.joined_at else None,
                'left_at': participant.left_at.isoformat() if participant.left_at else None,
                'status': 'present' if participant.joined_at else 'absent',
                'date': participant.joined_at.date().isoformat() if participant.joined_at else None
            })
        
        return jsonify({
            'success': True,
            'records': attendance_records,
            'total': len(attendance_records)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@attendance_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_attendance_history(user_id):
    """Get attendance history for a user"""
    try:
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        days = request.args.get('days', 30, type=int)
        
        # Use RFID service for students, biometric service for staff
        if user.role == 'student':
            result = rfid_service.get_attendance_history(user_id, days)
        else:
            # For staff, get general attendance history
            from datetime import timedelta
            start_date = datetime.now() - timedelta(days=days)
            
            records = Attendance.query.filter_by(user_id=user_id).filter(
                Attendance.timestamp >= start_date
            ).order_by(Attendance.timestamp.desc()).all()
            
            result = {
                'success': True,
                'records': [record.to_dict() for record in records],
                'total_count': len(records)
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching attendance history',
            'error': str(e)
        }), 500

@attendance_bp.route('/register-rfid', methods=['POST'])
@jwt_required()
def register_rfid():
    """Register RFID card for a user"""
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'rfid_card_id' not in data:
        return jsonify({
            'success': False, 
            'message': 'User ID and RFID card ID required'
        }), 400
    
    result = rfid_service.register_rfid_card(
        user_id=data['user_id'],
        rfid_card_id=data['rfid_card_id']
    )
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@attendance_bp.route('/register-biometric', methods=['POST'])
@jwt_required()
def register_biometric():
    """Register biometric template for a user"""
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'biometric_data' not in data:
        return jsonify({
            'success': False, 
            'message': 'User ID and biometric data required'
        }), 400
    
    result = biometric_service.register_biometric_template(
        user_id=data['user_id'],
        biometric_data=data['biometric_data']
    )
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@attendance_bp.route('/staff-summary', methods=['GET'])
@jwt_required()
def staff_attendance_summary():
    """Get staff attendance summary"""
    days = request.args.get('days', 30, type=int)
    result = biometric_service.get_staff_attendance_summary(days)
    
    status_code = 200 if result['success'] else 500
    return jsonify(result), status_code

@attendance_bp.route('/', methods=['POST'])
@jwt_required()
def mark_attendance():
    """Manual attendance marking (legacy endpoint)"""
    data = request.get_json()
    user_id = get_jwt_identity()['id']
    attendance = Attendance(
        user_id=user_id,
        timestamp=datetime.utcnow(),
        type=data.get('type', 'student'),
        status=data.get('status', 'present'),
        method='manual',
        notes=data.get('notes')
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Attendance marked', 'attendance': attendance.to_dict()}), 201

@attendance_bp.route('/', methods=['GET'])
@jwt_required()
def get_attendance():
    """Get current user's attendance records (legacy endpoint)"""
    user_id = get_jwt_identity()['id']
    records = Attendance.query.filter_by(user_id=user_id).order_by(Attendance.timestamp.desc()).limit(50).all()
    return jsonify({
        'success': True,
        'records': [rec.to_dict() for rec in records],
        'total_count': len(records)
    })
