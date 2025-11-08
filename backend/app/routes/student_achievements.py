from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.student_achievement import StudentAchievement

student_achievements_bp = Blueprint('student_achievements', __name__)

@student_achievements_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_achievements(student_id):
    """Get all achievements for a student"""
    try:
        achievements = StudentAchievement.query.filter_by(
            student_id=student_id,
            display_on_profile=True
        ).order_by(StudentAchievement.achievement_date.desc()).all()
        
        return jsonify({
            'success': True,
            'achievements': [a.to_dict() for a in achievements]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@student_achievements_bp.route('/create', methods=['POST'])
@jwt_required()
def create_achievement():
    """Create a new achievement"""
    try:
        data = request.json
        current_user_id = get_jwt_identity()
        
        achievement = StudentAchievement(
            student_id=data['student_id'],
            achievement_type=data['achievement_type'],
            title=data['title'],
            description=data.get('description'),
            category=data.get('category'),
            award_level=data.get('award_level', 'school'),
            achievement_date=datetime.fromisoformat(data['achievement_date']),
            academic_year=data.get('academic_year'),
            semester=data.get('semester'),
            points_awarded=data.get('points_awarded', 0),
            certificate_issued=data.get('certificate_issued', False),
            certificate_number=data.get('certificate_number'),
            awarded_by=data.get('awarded_by'),
            verified_by=current_user_id
        )
        
        db.session.add(achievement)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement created successfully',
            'achievement_id': achievement.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@student_achievements_bp.route('/<int:achievement_id>', methods=['PUT'])
@jwt_required()
def update_achievement(achievement_id):
    """Update an achievement"""
    try:
        achievement = StudentAchievement.query.get_or_404(achievement_id)
        data = request.json
        
        for key, value in data.items():
            if hasattr(achievement, key):
                setattr(achievement, key, value)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement updated successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@student_achievements_bp.route('/<int:achievement_id>', methods=['DELETE'])
@jwt_required()
def delete_achievement(achievement_id):
    """Delete an achievement"""
    try:
        achievement = StudentAchievement.query.get_or_404(achievement_id)
        db.session.delete(achievement)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@student_achievements_bp.route('/types', methods=['GET'])
def get_achievement_types():
    """Get all achievement types"""
    return jsonify({
        'success': True,
        'types': [
            'academic', 'sports', 'leadership', 'arts', 
            'community_service', 'attendance', 'behavior', 'other'
        ]
    })
