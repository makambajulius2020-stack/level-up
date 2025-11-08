from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.semesters import Semester
from app.models.user import User
from app import db
from datetime import datetime

holiday_schedules_bp = Blueprint('holiday_schedules', __name__)

@holiday_schedules_bp.route('/holiday-schedules', methods=['GET'])
@jwt_required()
def get_holiday_schedules():
    """Get all holiday schedules"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Get semester filter
        semester_id = request.args.get('semester_id', type=int)
        year = request.args.get('year')
        
        query = Semester.query
        
        if semester_id:
            query = query.filter_by(id=semester_id)
        if year:
            query = query.filter(Semester.name.like(f'%{year}%'))
        
        semesters = query.all()
        
        holidays = []
        for semester in semesters:
            if semester.holidays:
                holiday_list = semester.holidays.split(',') if isinstance(semester.holidays, str) else semester.holidays
                for holiday in holiday_list:
                    if holiday.strip():
                        holidays.append({
                            'id': f"{semester.id}_{holiday}",
                            'name': holiday.strip(),
                            'semester_id': semester.id,
                            'semester_name': semester.name,
                            'start_date': semester.start_date.isoformat() if semester.start_date else None,
                            'end_date': semester.end_date.isoformat() if semester.end_date else None
                        })
        
        return jsonify({
            'success': True,
            'holidays': holidays,
            'total': len(holidays)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@holiday_schedules_bp.route('/holiday-schedules', methods=['POST'])
@jwt_required()
def create_holiday_schedule():
    """Create a new holiday schedule"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('semester_id'):
            return jsonify({'success': False, 'error': 'Missing required fields: name, semester_id'}), 400
        
        semester = Semester.query.get(data['semester_id'])
        if not semester:
            return jsonify({'success': False, 'error': 'Semester not found'}), 404
        
        # Add holiday to semester holidays list
        current_holidays = semester.holidays.split(',') if semester.holidays else []
        if data['name'] not in current_holidays:
            current_holidays.append(data['name'])
            semester.holidays = ','.join(current_holidays)
            semester.updated_at = datetime.utcnow()
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Holiday schedule created successfully',
            'holiday': {
                'id': f"{semester.id}_{data['name']}",
                'name': data['name'],
                'semester_id': semester.id,
                'semester_name': semester.name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

