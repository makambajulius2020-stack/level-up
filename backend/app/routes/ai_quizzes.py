from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.ai_quiz import AIStudyQuiz, QuizQuestion

ai_quizzes_bp = Blueprint('ai_quizzes', __name__)

@ai_quizzes_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_quizzes(student_id):
    """Get all quizzes for a student"""
    try:
        quizzes = AIStudyQuiz.query.filter_by(
            student_id=student_id
        ).order_by(AIStudyQuiz.scheduled_date.desc()).all()
        
        return jsonify({
            'success': True,
            'quizzes': [q.to_dict() for q in quizzes]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@ai_quizzes_bp.route('/create', methods=['POST'])
@jwt_required()
def create_quiz():
    """Create a new AI-generated quiz"""
    try:
        data = request.json
        current_user_id = get_jwt_identity()
        
        quiz = AIStudyQuiz(
            student_id=data['student_id'],
            subject=data['subject'],
            topic=data['topic'],
            difficulty_level=data.get('difficulty_level', 'medium'),
            quiz_type=data.get('quiz_type', 'multiple_choice'),
            total_questions=data['total_questions'],
            time_limit_minutes=data.get('time_limit_minutes', 30),
            quiz_data=data.get('quiz_data', {}),
            scheduled_date=datetime.fromisoformat(data['scheduled_date']) if data.get('scheduled_date') else None,
            max_score=data['max_score']
        )
        
        db.session.add(quiz)
        db.session.flush()
        
        # Add questions
        if 'questions' in data:
            for idx, q_data in enumerate(data['questions'], 1):
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_number=idx,
                    question_text=q_data['question_text'],
                    question_type=q_data['question_type'],
                    options=q_data.get('options'),
                    correct_answer=q_data['correct_answer'],
                    points=q_data.get('points', 1),
                    explanation=q_data.get('explanation'),
                    difficulty=q_data.get('difficulty', 'medium')
                )
                db.session.add(question)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Quiz created successfully',
            'quiz_id': quiz.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ai_quizzes_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    """Get quiz details with questions"""
    try:
        quiz = AIStudyQuiz.query.get_or_404(quiz_id)
        quiz_dict = quiz.to_dict()
        quiz_dict['questions'] = [q.to_dict() for q in quiz.questions]
        
        return jsonify({
            'success': True,
            'quiz': quiz_dict
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@ai_quizzes_bp.route('/<int:quiz_id>/start', methods=['POST'])
@jwt_required()
def start_quiz(quiz_id):
    """Start a quiz"""
    try:
        quiz = AIStudyQuiz.query.get_or_404(quiz_id)
        quiz.status = 'in_progress'
        quiz.started_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Quiz started',
            'started_at': quiz.started_at.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ai_quizzes_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    """Submit quiz answers and calculate score"""
    try:
        quiz = AIStudyQuiz.query.get_or_404(quiz_id)
        data = request.json
        
        quiz.answers = data['answers']
        quiz.completed_at = datetime.utcnow()
        quiz.status = 'completed'
        
        # Calculate time taken
        if quiz.started_at:
            time_diff = quiz.completed_at - quiz.started_at
            quiz.time_taken_minutes = int(time_diff.total_seconds() / 60)
        
        # Calculate score
        correct_count = 0
        total_points = 0
        feedback = []
        
        for question in quiz.questions:
            student_answer = data['answers'].get(str(question.id))
            is_correct = student_answer == question.correct_answer
            
            if is_correct:
                correct_count += question.points
            
            total_points += question.points
            
            feedback.append({
                'question_id': question.id,
                'correct': is_correct,
                'student_answer': student_answer,
                'correct_answer': question.correct_answer,
                'explanation': question.explanation
            })
        
        quiz.score = correct_count
        quiz.max_score = total_points
        quiz.percentage = (correct_count / total_points * 100) if total_points > 0 else 0
        quiz.feedback = feedback
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Quiz submitted successfully',
            'score': float(quiz.score),
            'max_score': float(quiz.max_score),
            'percentage': float(quiz.percentage),
            'feedback': feedback
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ai_quizzes_bp.route('/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    """Delete a quiz"""
    try:
        quiz = AIStudyQuiz.query.get_or_404(quiz_id)
        db.session.delete(quiz)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Quiz deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
