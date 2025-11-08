from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, SchoolClass, Course, Timetable, TimetableEntry
from app.models.teacher import Teacher
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

timetable_bp = Blueprint('timetable', __name__)

@timetable_bp.route('/api/timetable/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_timetable(class_id):
    """Get timetable for a specific class"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Get the class information
        class_info = SchoolClass.query.get(class_id)
        if not class_info:
            return jsonify({'error': 'Class not found'}), 404
            
        # Get current week's timetable
        week_param = request.args.get('week', 0, type=int)
        start_date = datetime.now() + timedelta(weeks=week_param)
        start_of_week = start_date - timedelta(days=start_date.weekday())
        end_of_week = start_of_week + timedelta(days=4)  # Monday to Friday
        
        # Query timetable entries for the week
        timetable_entries = db.session.query(TimetableEntry)\
            .join(Timetable)\
            .filter(
                Timetable.class_id == class_id,
                TimetableEntry.date >= start_of_week.date(),
                TimetableEntry.date <= end_of_week.date()
            )\
            .order_by(TimetableEntry.date, TimetableEntry.start_time)\
            .all()
            
        # Organize by day
        schedule = {
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': []
        }
        
        days_map = {
            0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 
            3: 'Thursday', 4: 'Friday'
        }
        
        for entry in timetable_entries:
            day_name = days_map.get(entry.date.weekday())
            if day_name:
                course = Course.query.get(entry.subject_id)
                teacher_record = Teacher.query.get(entry.teacher_id) if entry.teacher_id else None
                
                period_data = {
                    'id': entry.id,
                    'time': f"{entry.start_time.strftime('%H:%M')}-{entry.end_time.strftime('%H:%M')}",
                    'subject': course.name if course else 'Unknown',
                    'subject_code': course.code if course else '',
                    'teacher': teacher_record.name if teacher_record else 'TBA',
                    'teacher_id': teacher_record.id if teacher_record else None,
                    'room': entry.room or 'TBA',
                    'type': entry.period_type or 'core',
                    'notes': entry.notes or ''
                }
                schedule[day_name].append(period_data)
        
        response_data = {
            'class': {
                'id': class_info.id,
                'name': class_info.name,
                'level': class_info.level,
                'section': class_info.section
            },
            'week': {
                'number': week_param + 1,
                'start_date': start_of_week.strftime('%Y-%m-%d'),
                'end_date': end_of_week.strftime('%Y-%m-%d')
            },
            'schedule': schedule,
            'semester': 'Semester 1, 2024'  # This could be dynamic based on current semester
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching class timetable: {str(e)}")
        return jsonify({'error': 'Failed to fetch timetable'}), 500

@timetable_bp.route('/api/timetable/student', methods=['GET'])
@jwt_required()
def get_student_timetable():
    """Get timetable for the current student's class"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Access denied'}), 403
            
        # Get student's class
        if not user.class_id:
            return jsonify({'error': 'Student not assigned to a class'}), 400
            
        # Redirect to class timetable endpoint
        return get_class_timetable(user.class_id)
        
    except Exception as e:
        logger.error(f"Error fetching student timetable: {str(e)}")
        return jsonify({'error': 'Failed to fetch student timetable'}), 500

@timetable_bp.route('/api/timetable/teacher', methods=['GET'])
@jwt_required()
def get_teacher_timetable():
    """Get timetable for the current teacher"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'teacher':
            return jsonify({'error': 'Access denied'}), 403
            
        # Get teacher's schedule across all classes
        week_param = request.args.get('week', 0, type=int)
        start_date = datetime.now() + timedelta(weeks=week_param)
        start_of_week = start_date - timedelta(days=start_date.weekday())
        end_of_week = start_of_week + timedelta(days=4)
        
        # Find teacher record - check if user is a teacher and get their teacher record
        teacher_user = User.query.get(current_user_id)
        if not teacher_user or teacher_user.role != 'teacher':
            return jsonify({'error': 'Teacher profile not found'}), 404
        
        # Try to find teacher record by matching name or create a simple lookup
        # For now, we'll query by teacher_id in timetable entries that match user
        # Since Teacher model doesn't have user_id, we'll need to match differently
        # For simplicity, let's query all entries and filter by user if needed
        teacher_record = Teacher.query.filter_by(name=teacher_user.full_name if hasattr(teacher_user, 'full_name') else f"{teacher_user.first_name} {teacher_user.last_name}").first()
        
        if not teacher_record:
            # If no teacher record found, return empty schedule
            return jsonify({
                'teacher': {
                    'id': teacher_user.id,
                    'name': teacher_user.full_name if hasattr(teacher_user, 'full_name') else f"{teacher_user.first_name} {teacher_user.last_name}",
                    'subjects': []
                },
                'week': {
                    'number': week_param + 1,
                    'start_date': start_of_week.strftime('%Y-%m-%d'),
                    'end_date': end_of_week.strftime('%Y-%m-%d')
                },
                'schedule': {'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': []},
                'semester': 'Semester 1, 2024'
            }), 200
            
        # Query timetable entries for the teacher
        timetable_entries = db.session.query(TimetableEntry)\
            .join(Timetable)\
            .join(SchoolClass)\
            .filter(
                TimetableEntry.teacher_id == teacher_record.id,
                TimetableEntry.date >= start_of_week.date(),
                TimetableEntry.date <= end_of_week.date()
            )\
            .order_by(TimetableEntry.date, TimetableEntry.start_time)\
            .all()
            
        # Organize by day
        schedule = {
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': []
        }
        
        days_map = {
            0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 
            3: 'Thursday', 4: 'Friday'
        }
        
        for entry in timetable_entries:
            day_name = days_map.get(entry.date.weekday())
            if day_name:
                course = Course.query.get(entry.subject_id)
                class_info = SchoolClass.query.get(entry.timetable.class_id)
                
                period_data = {
                    'id': entry.id,
                    'time': f"{entry.start_time.strftime('%H:%M')}-{entry.end_time.strftime('%H:%M')}",
                    'subject': course.name if course else 'Unknown',
                    'class': class_info.name if class_info else 'Unknown',
                    'class_id': class_info.id if class_info else None,
                    'room': entry.room or 'TBA',
                    'type': entry.period_type or 'core',
                    'notes': entry.notes or ''
                }
                schedule[day_name].append(period_data)
        
        # Get teacher's courses
        teacher_courses = Course.query.join('teacher_courses').filter_by(teacher_id=teacher.id).all() if hasattr(Course, 'teacher_courses') else []
        
        response_data = {
            'teacher': {
                'id': teacher_user.id,
                'name': teacher_user.full_name if hasattr(teacher_user, 'full_name') else f"{teacher_user.first_name} {teacher_user.last_name}",
                'subjects': [c.name for c in teacher_courses] if teacher_courses else []
            },
            'week': {
                'number': week_param + 1,
                'start_date': start_of_week.strftime('%Y-%m-%d'),
                'end_date': end_of_week.strftime('%Y-%m-%d')
            },
            'schedule': schedule,
            'term': 'Term 3, 2024'
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching teacher timetable: {str(e)}")
        return jsonify({'error': 'Failed to fetch teacher timetable'}), 500

@timetable_bp.route('/api/timetable/create', methods=['POST'])
@jwt_required()
def create_timetable_entry():
    """Create a new timetable entry (Admin/Teacher only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Access denied'}), 403
            
        data = request.get_json()
        required_fields = ['class_id', 'subject_id', 'date', 'start_time', 'end_time']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Get or create timetable for the class
        timetable = Timetable.query.filter_by(class_id=data['class_id']).first()
        if not timetable:
            timetable = Timetable(
                class_id=data['class_id'],
                term='Term 3',
                year=2024,
                created_by=current_user_id
            )
            db.session.add(timetable)
            db.session.flush()
            
        # Create timetable entry
        entry = TimetableEntry(
            timetable_id=timetable.id,
            subject_id=data['subject_id'],
            teacher_id=data.get('teacher_id'),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            room=data.get('room'),
            period_type=data.get('type', 'core'),
            notes=data.get('notes', '')
        )
        
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Timetable entry created successfully',
            'entry_id': entry.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating timetable entry: {str(e)}")
        return jsonify({'error': 'Failed to create timetable entry'}), 500

@timetable_bp.route('/api/timetable/update/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_timetable_entry(entry_id):
    """Update a timetable entry (Admin/Teacher only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Access denied'}), 403
            
        entry = TimetableEntry.query.get(entry_id)
        if not entry:
            return jsonify({'error': 'Timetable entry not found'}), 404
            
        data = request.get_json()
        
        # Update fields if provided
        if 'subject_id' in data:
            entry.subject_id = data['subject_id']
        if 'teacher_id' in data:
            entry.teacher_id = data['teacher_id']
        if 'date' in data:
            entry.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'start_time' in data:
            entry.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        if 'end_time' in data:
            entry.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        if 'room' in data:
            entry.room = data['room']
        if 'type' in data:
            entry.period_type = data['type']
        if 'notes' in data:
            entry.notes = data['notes']
            
        db.session.commit()
        
        return jsonify({'message': 'Timetable entry updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating timetable entry: {str(e)}")
        return jsonify({'error': 'Failed to update timetable entry'}), 500

@timetable_bp.route('/api/timetable/delete/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_timetable_entry(entry_id):
    """Delete a timetable entry (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Access denied'}), 403
            
        entry = TimetableEntry.query.get(entry_id)
        if not entry:
            return jsonify({'error': 'Timetable entry not found'}), 404
            
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({'message': 'Timetable entry deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting timetable entry: {str(e)}")
        return jsonify({'error': 'Failed to delete timetable entry'}), 500
