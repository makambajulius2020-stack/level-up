from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.plagiarism_service import PlagiarismService

ai_bp = Blueprint('ai', __name__)

# Initialize services
ai_service = AIAnalyticsService()
plagiarism_service = PlagiarismService()

@ai_bp.route('/performance/<student_id>', methods=['GET'])
@jwt_required()
def analyze_performance(student_id):
    """Analyze student performance and generate insights"""
    try:
        # Get optional parameters
        subject = request.args.get('subject')
        academic_term = request.args.get('academic_term', 'Term 1')
        academic_year = request.args.get('academic_year', '2024')
        
        result = ai_service.analyze_student_performance(
            student_id=student_id,
            subject_area=subject,
            academic_term=academic_term,
            academic_year=academic_year
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error analyzing student performance',
            'error': str(e)
        }), 500

@ai_bp.route('/dropout-risk/<student_id>', methods=['GET'])
@jwt_required()
def analyze_dropout_risk(student_id):
    """Analyze student dropout risk"""
    try:
        # Get performance analysis which includes dropout risk
        result = ai_service.analyze_student_performance(student_id)
        
        if result['success']:
            dropout_analysis = {
                'success': True,
                'student_id': student_id,
                'student_name': result['student_name'],
                'dropout_risk_score': result['predictions']['dropout_risk'],
                'risk_level': 'high' if result['predictions']['dropout_risk'] > 0.7 else 
                            'medium' if result['predictions']['dropout_risk'] > 0.4 else 'low',
                'risk_factors': result['predictions']['risk_factors'],
                'intervention_needed': result['intervention_needed'],
                'recommendations': result['recommendations'],
                'confidence': result['predictions']['confidence']
            }
            return jsonify(dropout_analysis)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error analyzing dropout risk',
            'error': str(e)
        }), 500

@ai_bp.route('/class-analytics', methods=['GET'])
@jwt_required()
def class_analytics():
    """Get analytics for entire class"""
    try:
        class_id = request.args.get('class_id')
        subject = request.args.get('subject')
        
        result = ai_service.get_class_analytics(class_id, subject)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating class analytics',
            'error': str(e)
        }), 500

@ai_bp.route('/uneb-readiness/<student_id>', methods=['GET'])
@jwt_required()
def uneb_readiness(student_id):
    """Generate UNEB examination readiness report"""
    try:
        result = ai_service.generate_uneb_readiness_report(student_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating UNEB readiness report',
            'error': str(e)
        }), 500

@ai_bp.route('/plagiarism/check', methods=['POST'])
@jwt_required()
def check_plagiarism():
    """Check submission for plagiarism"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'assignment_id', 'submission_title', 'submission_content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = plagiarism_service.check_plagiarism(
            student_id=data['student_id'],
            assignment_id=data['assignment_id'],
            submission_title=data['submission_title'],
            submission_content=data['submission_content'],
            subject=data.get('subject'),
            academic_term=data.get('academic_term', 'Term 1'),
            academic_year=data.get('academic_year', '2024')
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error checking plagiarism',
            'error': str(e)
        }), 500

@ai_bp.route('/plagiarism/review', methods=['POST'])
@jwt_required()
def review_plagiarism():
    """Review a plagiarism case"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()['id']
        
        # Validate required fields
        required_fields = ['check_id', 'status', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate status
        valid_statuses = ['approved', 'rejected', 'needs_revision']
        if data['status'] not in valid_statuses:
            return jsonify({
                'success': False,
                'message': f'Invalid status. Valid statuses: {valid_statuses}'
            }), 400
        
        result = plagiarism_service.review_plagiarism_case(
            check_id=data['check_id'],
            reviewer_id=current_user_id,
            status=data['status'],
            notes=data['notes']
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error reviewing plagiarism case',
            'error': str(e)
        }), 500

@ai_bp.route('/plagiarism/statistics', methods=['GET'])
@jwt_required()
def plagiarism_statistics():
    """Get plagiarism statistics"""
    try:
        academic_term = request.args.get('academic_term', 'Term 1')
        academic_year = request.args.get('academic_year', '2024')
        
        result = plagiarism_service.get_plagiarism_statistics(
            academic_term=academic_term,
            academic_year=academic_year
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating plagiarism statistics',
            'error': str(e)
        }), 500

@ai_bp.route('/insights/dashboard', methods=['GET'])
@jwt_required()
def ai_dashboard():
    """Get AI insights for dashboard"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        dashboard_data = {
            'success': True,
            'user_role': current_user.role,
            'insights': []
        }
        
        if current_user.role == 'student':
            # Student-specific insights
            if current_user.student_id:
                performance_result = ai_service.analyze_student_performance(current_user.student_id)
                if performance_result['success']:
                    dashboard_data['insights'] = [
                        {
                            'type': 'performance',
                            'title': 'Academic Performance',
                            'score': performance_result['metrics']['overall_score'],
                            'trend': performance_result['metrics']['grade_trend'],
                            'recommendations': performance_result['recommendations'][:3]
                        },
                        {
                            'type': 'attendance',
                            'title': 'Attendance Rate',
                            'score': performance_result['metrics']['attendance_rate'],
                            'status': 'good' if performance_result['metrics']['attendance_rate'] > 85 else 'needs_improvement'
                        }
                    ]
        
        elif current_user.role == 'teacher':
            # Teacher-specific insights
            class_result = ai_service.get_class_analytics()
            if class_result['success']:
                analytics = class_result['class_analytics']
                dashboard_data['insights'] = [
                    {
                        'type': 'class_overview',
                        'title': 'Class Performance Overview',
                        'total_students': analytics['total_students'],
                        'top_performers': len(analytics['top_performers']),
                        'at_risk_students': len(analytics['at_risk_students'])
                    }
                ]
        
        elif current_user.role == 'admin':
            # Admin-specific insights
            class_result = ai_service.get_class_analytics()
            plagiarism_stats = plagiarism_service.get_plagiarism_statistics()
            
            insights = []
            
            if class_result['success']:
                analytics = class_result['class_analytics']
                insights.append({
                    'type': 'school_overview',
                    'title': 'School Performance Overview',
                    'total_students': analytics['total_students'],
                    'performance_distribution': analytics['performance_distribution'],
                    'at_risk_count': len(analytics['at_risk_students'])
                })
            
            if plagiarism_stats['success']:
                stats = plagiarism_stats['statistics']
                insights.append({
                    'type': 'academic_integrity',
                    'title': 'Academic Integrity',
                    'total_submissions': stats['total_submissions'],
                    'plagiarism_rate': stats['plagiarism_rate'],
                    'flagged_submissions': stats['flagged_submissions']
                })
            
            dashboard_data['insights'] = insights
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating AI dashboard',
            'error': str(e)
        }), 500

@ai_bp.route('/recommendations/<student_id>', methods=['GET'])
@jwt_required()
def get_recommendations(student_id):
    """Get AI-powered recommendations for a student"""
    try:
        # Get performance analysis
        result = ai_service.analyze_student_performance(student_id)
        
        if not result['success']:
            return jsonify(result), 400
        
        # Enhanced recommendations with UNEB focus
        recommendations = result['recommendations']
        
        # Add UNEB-specific recommendations
        uneb_result = ai_service.generate_uneb_readiness_report(student_id)
        if uneb_result['success']:
            uneb_recommendations = uneb_result['uneb_readiness']['recommended_actions']
            recommendations.extend([
                {
                    'category': 'uneb_preparation',
                    'priority': 'high',
                    'action': action,
                    'description': f'UNEB preparation: {action}'
                }
                for action in uneb_recommendations
            ])
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'student_name': result['student_name'],
            'recommendations': recommendations,
            'total_recommendations': len(recommendations)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating recommendations',
            'error': str(e)
        }), 500
