from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.grade import Grade
from app.models.assignment import AssignmentSubmission
from app.models.attendance import Attendance
from app.models.class_management import SchoolClass, StudentEnrollment
from app.models.semesters import Semester
from datetime import datetime, timedelta
from sqlalchemy import func, case, not_

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Get leaderboard data for higher institute (adult education) system with semester-based filtering"""
    try:
        # Higher institute system uses semesters only (Semester 1, Semester 2, Semester 3)
        period = request.args.get('period', 'current_semester')
        category = request.args.get('category', 'overall')
        class_filter = request.args.get('class') or 'all'  # Default to 'all' if not provided
        
        # Get current semester for higher institute (adult education)
        current_date = datetime.utcnow().date()
        current_semester = Semester.query.filter(
            Semester.start_date <= current_date,
            Semester.end_date >= current_date,
            Semester.status == 'active'
        ).first()
        
        # Determine date range based on period (semester-based for higher institute)
        if period == 'current_semester' and current_semester:
            start_date = current_semester.start_date
            end_date = current_semester.end_date
            semester_name = current_semester.name
        elif period == 'last_month':
            end_date = datetime.utcnow().date()
            start_date = end_date - timedelta(days=30)
            semester_name = 'Last Month'
        elif period == 'last_semester':
            # Get the most recent completed semester
            last_semester = Semester.query.filter(
                Semester.end_date < current_date,
                Semester.status == 'completed'
            ).order_by(Semester.end_date.desc()).first()
            if last_semester:
                start_date = last_semester.start_date
                end_date = last_semester.end_date
                semester_name = last_semester.name
            else:
                start_date = current_date - timedelta(days=90)
                end_date = current_date
                semester_name = 'Last Semester'
        else:
            # Default to last 30 days
            end_date = datetime.utcnow().date()
            start_date = end_date - timedelta(days=30)
            semester_name = 'Recent'
        
        # Base query for students
        students_query = User.query.filter_by(role='student')
        
        # Filter by class if specified
        if class_filter != 'all':
            # Get students enrolled in the specified class
            class_obj = SchoolClass.query.filter_by(code=class_filter, is_active=True).first()
            if class_obj:
                # Reject high school classes - higher institute (adult education) system only
                # Exclude both O-Level and A-Level (both are high school/secondary education)
                high_school_levels = ['O-Level', 'A-Level']
                if class_obj.level in high_school_levels:
                    return jsonify({
                        'success': True,
                        'data': [],
                        'period': semester_name,
                        'message': 'High school classes are not available. This system is for higher institute (adult education) only.'
                    }), 200
                
                enrollments = StudentEnrollment.query.filter_by(
                    class_id=class_obj.id,
                    is_active=True
                ).all()
                student_ids = [e.student_id for e in enrollments]
                students_query = students_query.filter(User.id.in_(student_ids))
            else:
                return jsonify({
                    'success': True,
                    'data': [],
                    'period': semester_name,
                    'message': 'Class not found'
                }), 200
        else:
            # Higher institute system (adult education) - exclude high school levels
            # Supported higher institute levels: Year 1, Year 2, Year 3, Year 4, Graduate, Postgraduate
            # Exclude: O-Level and A-Level (both are high school/secondary education)
            high_school_levels = ['O-Level', 'A-Level']  # Both are high school levels to exclude
            higher_institute_classes = SchoolClass.query.filter(
                not_(SchoolClass.level.in_(high_school_levels)),  # Exclude high school classes
                SchoolClass.is_active == True
            ).all()
            class_ids = [cls.id for cls in higher_institute_classes]
            
            if class_ids:
                enrollments = StudentEnrollment.query.filter(
                    StudentEnrollment.class_id.in_(class_ids),
                    StudentEnrollment.is_active == True
                ).all()
                student_ids = list(set([e.student_id for e in enrollments]))
                students_query = students_query.filter(User.id.in_(student_ids))
            else:
                # If no higher institute classes, return empty
                return jsonify({
                    'success': True,
                    'data': [],
                    'period': semester_name,
                    'message': 'No higher institute classes found'
                }), 200
        
        students = students_query.all()
        
        leaderboard_data = []
        
        for student in students:
            # Get student's class
            enrollment = StudentEnrollment.query.filter_by(
                student_id=student.id,
                is_active=True
            ).first()
            student_class = enrollment.school_class.name if enrollment and enrollment.school_class else 'N/A'
            class_code = enrollment.school_class.code if enrollment and enrollment.school_class else 'N/A'
            
            # Calculate scores based on category
            if category == 'overall':
                # Overall performance: combine grades, assignments, and attendance
                grades = Grade.query.filter(
                    Grade.student_id == student.id,
                    Grade.assessment_date >= datetime.combine(start_date, datetime.min.time()),
                    Grade.assessment_date <= datetime.combine(end_date, datetime.max.time())
                ).all()
                
                assignments = AssignmentSubmission.query.filter(
                    AssignmentSubmission.student_id == student.id,
                    AssignmentSubmission.submitted_at >= datetime.combine(start_date, datetime.min.time()),
                    AssignmentSubmission.submitted_at <= datetime.combine(end_date, datetime.max.time()),
                    AssignmentSubmission.status == 'graded'
                ).all()
                
                # Calculate average grade score
                grade_score = 0
                if grades:
                    grade_score = sum([g.percentage for g in grades]) / len(grades)
                
                # Calculate average assignment score
                assignment_score = 0
                if assignments:
                    assignment_score = sum([a.percentage or 0 for a in assignments]) / len(assignments)
                
                # Calculate attendance percentage
                attendances = Attendance.query.filter(
                    Attendance.user_id == student.id,
                    Attendance.timestamp >= datetime.combine(start_date, datetime.min.time()),
                    Attendance.timestamp <= datetime.combine(end_date, datetime.max.time())
                ).all()
                
                attendance_percentage = 0
                if attendances:
                    present_count = len([a for a in attendances if a.status == 'present'])
                    attendance_percentage = (present_count / len(attendances)) * 100
                
                # Overall score: 50% grades, 30% assignments, 20% attendance
                total_score = (grade_score * 0.5) + (assignment_score * 0.3) + (attendance_percentage * 0.2)
                
                leaderboard_data.append({
                    'id': student.id,
                    'name': student.name,
                    'avatar': student.name[0].upper() if student.name else '?',
                    'class': student_class,
                    'class_code': class_code,
                    'totalScore': round(total_score, 2),
                    'score': round(total_score, 2),
                    'tests': {
                        'completed': len([g for g in grades if g.assessment_type == 'exam']),
                        'average': round(sum([g.percentage for g in grades if g.assessment_type == 'exam']) / len([g for g in grades if g.assessment_type == 'exam']), 2) if [g for g in grades if g.assessment_type == 'exam'] else 0
                    },
                    'assignments': {
                        'completed': len(assignments),
                        'average': round(assignment_score, 2)
                    },
                    'projects': {
                        'completed': len([g for g in grades if g.assessment_type == 'project']),
                        'average': round(sum([g.percentage for g in grades if g.assessment_type == 'project']) / len([g for g in grades if g.assessment_type == 'project']), 2) if [g for g in grades if g.assessment_type == 'project'] else 0
                    },
                    'attendance': round(attendance_percentage, 2),
                    'trend': 'up',  # Could be calculated based on previous period comparison
                    'streak': 0,  # Could be calculated based on consecutive days
                    'badges': []
                })
                
            elif category == 'tests':
                # Test scores only
                grades = Grade.query.filter(
                    Grade.student_id == student.id,
                    Grade.assessment_type == 'exam',
                    Grade.assessment_date >= datetime.combine(start_date, datetime.min.time()),
                    Grade.assessment_date <= datetime.combine(end_date, datetime.max.time())
                ).all()
                
                if grades:
                    avg_score = sum([g.percentage for g in grades]) / len(grades)
                    leaderboard_data.append({
                        'id': student.id,
                        'name': student.name,
                        'avatar': student.name[0].upper() if student.name else '?',
                        'class': student_class,
                        'class_code': class_code,
                        'totalScore': round(avg_score, 2),
                        'score': round(avg_score, 2),
                        'tests': round(avg_score, 2),
                        'trend': 'up',
                        'badges': []
                    })
                    
            elif category == 'assignments':
                # Assignment scores only
                assignments = AssignmentSubmission.query.filter(
                    AssignmentSubmission.student_id == student.id,
                    AssignmentSubmission.submitted_at >= datetime.combine(start_date, datetime.min.time()),
                    AssignmentSubmission.submitted_at <= datetime.combine(end_date, datetime.max.time()),
                    AssignmentSubmission.status == 'graded'
                ).all()
                
                if assignments:
                    avg_score = sum([a.percentage or 0 for a in assignments]) / len(assignments)
                    leaderboard_data.append({
                        'id': student.id,
                        'name': student.name,
                        'avatar': student.name[0].upper() if student.name else '?',
                        'class': student_class,
                        'class_code': class_code,
                        'totalScore': round(avg_score, 2),
                        'score': round(avg_score, 2),
                        'assignments': round(avg_score, 2),
                        'trend': 'up',
                        'badges': []
                    })
                    
            elif category == 'attendance':
                # Attendance only
                attendances = Attendance.query.filter(
                    Attendance.user_id == student.id,
                    Attendance.timestamp >= datetime.combine(start_date, datetime.min.time()),
                    Attendance.timestamp <= datetime.combine(end_date, datetime.max.time())
                ).all()
                
                if attendances:
                    present_count = len([a for a in attendances if a.status == 'present'])
                    attendance_percentage = (present_count / len(attendances)) * 100
                    leaderboard_data.append({
                        'id': student.id,
                        'name': student.name,
                        'avatar': student.name[0].upper() if student.name else '?',
                        'class': student_class,
                        'class_code': class_code,
                        'totalScore': round(attendance_percentage, 2),
                        'score': round(attendance_percentage, 2),
                        'attendance': round(attendance_percentage, 2),
                        'trend': 'up',
                        'badges': []
                    })
        
        # Sort by score (descending) and assign ranks
        leaderboard_data.sort(key=lambda x: x['totalScore'], reverse=True)
        for idx, student in enumerate(leaderboard_data, 1):
            student['rank'] = idx
        
        return jsonify({
            'success': True,
            'data': leaderboard_data,
            'period': semester_name,
            'category': category,
            'class_filter': class_filter
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        }), 500

