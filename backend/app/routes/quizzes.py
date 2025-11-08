from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.quiz import QuizResult

quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('/results', methods=['POST'])
@jwt_required()
def save_result():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        data = request.get_json(force=True)
        student_id = data.get('student_id') or user_id
        subject = data.get('subject')
        topic = data.get('topic')
        score = int(data.get('score', 0))
        total = int(data.get('total', 0))

        result = QuizResult(student_id=student_id, subject=subject, topic=topic, score=score, total=total)
        db.session.add(result)
        db.session.commit()
        return jsonify({'success': True, 'result': result.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@quizzes_bp.route('/results', methods=['GET'])
@jwt_required()
def list_results():
    try:
        user_id = get_jwt_identity()
        student_id = request.args.get('student_id') or user_id
        q = QuizResult.query.filter_by(student_id=student_id).order_by(QuizResult.created_at.desc())
        items = [r.to_dict() for r in q.limit(50).all()]
        return jsonify({'success': True, 'results': items})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
