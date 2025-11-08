from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.biometric import BiometricData, BiometricAttendanceLog
from app.models.user import User

biometric_bp = Blueprint('biometric', __name__)

@biometric_bp.route('/enroll', methods=['POST'])
@jwt_required()
def enroll_biometric():
    """Enroll fingerprint for a student"""
    try:
        data = request.json
        current_user_id = get_jwt_identity()
        
        # Create biometric record
        biometric = BiometricData(
            user_id=data['user_id'],
            biometric_type='fingerprint',
            biometric_hash=data['biometric_hash'],
            template_data=data['template_data'].encode(),
            finger_position=data.get('finger_position'),
            quality_score=data.get('quality_score', 0),
            enrolled_by=current_user_id,
            device_id=data.get('device_id'),
            notes=data.get('notes')
        )
        
        db.session.add(biometric)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fingerprint enrolled successfully',
            'biometric_id': biometric.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@biometric_bp.route('/verify', methods=['POST'])
def verify_biometric():
    """Verify fingerprint and log attendance"""
    try:
        data = request.json
        
        # Find matching biometric
        biometric = BiometricData.query.filter_by(
            biometric_hash=data['biometric_hash'],
            is_active=True
        ).first()
        
        if not biometric:
            return jsonify({
                'success': False,
                'message': 'Fingerprint not recognized'
            }), 404
        
        # Update verification stats
        biometric.last_verified = datetime.utcnow()
        biometric.verification_count += 1
        
        # Log attendance
        log = BiometricAttendanceLog(
            user_id=biometric.user_id,
            biometric_id=biometric.id,
            scan_type=data.get('scan_type', 'check_in'),
            location=data.get('location'),
            device_id=data.get('device_id'),
            match_score=data.get('match_score', 100),
            verification_status='success',
            ip_address=request.remote_addr
        )
        
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Verification successful',
            'user_id': biometric.user_id,
            'scan_type': log.scan_type
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@biometric_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_biometrics(student_id):
    """Get all biometric records for a student"""
    try:
        biometrics = BiometricData.query.filter_by(user_id=student_id).all()
        return jsonify({
            'success': True,
            'biometrics': [b.to_dict() for b in biometrics]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@biometric_bp.route('/logs/<int:student_id>', methods=['GET'])
@jwt_required()
def get_attendance_logs(student_id):
    """Get biometric attendance logs for a student"""
    try:
        logs = BiometricAttendanceLog.query.filter_by(
            user_id=student_id
        ).order_by(BiometricAttendanceLog.scan_timestamp.desc()).limit(50).all()
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@biometric_bp.route('/<int:biometric_id>/deactivate', methods=['POST'])
@jwt_required()
def deactivate_biometric(biometric_id):
    """Deactivate a biometric record"""
    try:
        biometric = BiometricData.query.get_or_404(biometric_id)
        biometric.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Biometric deactivated successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
