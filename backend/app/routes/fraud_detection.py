from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.fraud_detection_service import FraudDetectionService
from app.utils.decorators import role_required

fraud_detection_bp = Blueprint('fraud_detection', __name__)
fraud_service = FraudDetectionService()

@fraud_detection_bp.route('/rules/create', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_fraud_rule():
    """Create a new fraud detection rule"""
    try:
        current_user_id = get_jwt_identity()
        rule_data = request.get_json()
        
        result = fraud_service.create_fraud_rule(rule_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@fraud_detection_bp.route('/check-onboarding', methods=['POST'])
def check_onboarding_fraud():
    """Check for fraud during user onboarding"""
    try:
        data = request.get_json()
        user_data = data.get('user_data', {})
        request_data = data.get('request_data', {})
        
        result = fraud_service.check_onboarding_fraud(user_data, request_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@fraud_detection_bp.route('/detect-login-anomalies', methods=['POST'])
@jwt_required()
def detect_login_anomalies():
    """Detect login anomalies"""
    try:
        current_user_id = get_jwt_identity()
        login_data = request.get_json()
        
        result = fraud_service.detect_login_anomalies(current_user_id, login_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@fraud_detection_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_fraud_dashboard():
    """Get fraud detection dashboard"""
    try:
        result = fraud_service.get_fraud_dashboard()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
