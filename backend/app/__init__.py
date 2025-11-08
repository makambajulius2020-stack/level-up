from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Import role decorators
from app.utils.decorators import admin_required, teacher_required, student_required

def create_app():
    """Application factory for the Smart School backend."""
    app = Flask(__name__, instance_relative_config=True)

    # Configuration
    app.config.from_object('config')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY', 'your-secret-key-here')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'success': False, 'message': 'Invalid token', 'error': str(error)}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'success': False, 'message': 'Authorization token is required'}), 401

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Global error handlers to ensure JSON responses
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'msg': 'Endpoint not found', 'error': 'The requested resource does not exist'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'msg': 'Internal server error', 'error': str(error) if app.debug else 'An internal error occurred'}), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'msg': 'Bad request', 'error': str(error)}), 400
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'msg': 'Method not allowed', 'error': 'The HTTP method is not allowed for this endpoint'}), 405

    # ----------------------------
    # Register blueprints
    # ----------------------------
    from app.routes.analytics import analytics_bp
    from app.routes.fee_structure import fee_structure_bp
    from app.routes.cocurricular import cocurricular_bp
    from app.routes.auth import auth_bp
    from app.routes.enhanced_payments import enhanced_payments_bp
    from app.routes.profile import profile_bp
    from app.routes.notifications import notifications_bp
    from app.routes.messaging import messaging_bp
    from app.routes.library import library_bp
    from app.routes.admin import admin_bp
    from app.routes.attendance import attendance_bp
    from app.routes.exams import exams_bp
    from app.routes.grades import grades_bp
    from app.routes.ai_analytics import ai_bp
    from app.routes.payments import payments_bp
    from app.routes.users import users_bp
    from app.routes.student_achievements import student_achievements_bp
    from app.routes.courses import courses_bp
    from app.routes.departments import departments_bp
    from app.routes.assignments import assignments_bp
    from app.routes.quizzes import quizzes_bp
    from app.routes.awards import awards_bp
    from app.routes.complaints import complaints_bp
    from app.routes.biometric import biometric_bp
    from app.routes.invoices import invoices_bp
    from app.routes.expenses import expenses_bp
    from app.routes.payroll import payroll_bp
    from app.routes.semesters import semesters_bp
    from app.routes.timetable import timetable_bp
    from app.routes.class_management import class_management_bp, get_classes, create_class, get_subjects, create_subject
    from app.routes.lesson_plans import lesson_plans_bp
    from app.routes.file_uploads import file_uploads_bp
    from app.routes.fraud_detection import fraud_detection_bp
    from app.routes.enhanced_assignments import enhanced_assignments_bp
    from app.routes.enhanced_profiles import enhanced_profiles_bp
    from app.routes.ai_quizzes import ai_quizzes_bp
    from app.routes.school_media import school_media_bp
    from app.routes.n8n_webhooks import n8n_bp
    from app.routes.holiday_schedules import holiday_schedules_bp
    from app.routes.tests import tests_bp
    from app.routes.finance import finance_bp
    from app.routes.examinations import examinations_bp
    from app.routes.leaderboard import leaderboard_bp
    from content_api import content_bp

    # Try to import proctoring API if it exists
    try:
        from proctoring_api import proctoring_bp
    except ImportError:
        proctoring_bp = None

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(cocurricular_bp, url_prefix="/api/activities")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(messaging_bp, url_prefix="/api/messaging")
    app.register_blueprint(library_bp, url_prefix="/api/library")
    app.register_blueprint(fee_structure_bp, url_prefix="/api")
    app.register_blueprint(enhanced_payments_bp, url_prefix="/api/enhanced-payments")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(exams_bp, url_prefix="/api/exams")
    app.register_blueprint(grades_bp, url_prefix="/api/grades")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(student_achievements_bp, url_prefix="/api/student-achievements")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(departments_bp, url_prefix="/api/departments")
    app.register_blueprint(assignments_bp, url_prefix="/api/assignments")
    app.register_blueprint(quizzes_bp, url_prefix="/api/quizzes")
    app.register_blueprint(awards_bp, url_prefix="/api/awards")
    app.register_blueprint(complaints_bp, url_prefix="/api/complaints")
    app.register_blueprint(biometric_bp, url_prefix="/api/biometric")
    app.register_blueprint(invoices_bp, url_prefix="/api/invoices")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(payroll_bp)
    app.register_blueprint(semesters_bp, url_prefix="/api/semesters")
    app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
    app.register_blueprint(class_management_bp, url_prefix="/api/class-management")
    app.register_blueprint(lesson_plans_bp, url_prefix="/api/lesson-plans")
    app.register_blueprint(file_uploads_bp, url_prefix="/api/file-uploads")
    app.register_blueprint(fraud_detection_bp, url_prefix="/api/fraud-detection")
    app.register_blueprint(enhanced_assignments_bp, url_prefix="/api/enhanced-assignments")
    app.register_blueprint(enhanced_profiles_bp, url_prefix="/api/enhanced-profiles")
    app.register_blueprint(ai_quizzes_bp, url_prefix="/api/ai-quizzes")
    app.register_blueprint(school_media_bp, url_prefix="/api/school-media")
    app.register_blueprint(n8n_bp)
    app.register_blueprint(holiday_schedules_bp, url_prefix="/api")
    app.register_blueprint(tests_bp, url_prefix="/api")
    app.register_blueprint(finance_bp, url_prefix="/api")
    app.register_blueprint(examinations_bp, url_prefix="/api")
    app.register_blueprint(leaderboard_bp, url_prefix="/api")
    app.register_blueprint(content_bp)
    if proctoring_bp:
        try:
            app.register_blueprint(proctoring_bp)
        except:
            pass

    # Automatically create database tables
    with app.app_context():
        db.create_all()

    # ----------------------------
    # Health check route
    # ----------------------------
    @app.route("/api/health")
    def health_check():
        return {"status": "ok", "message": "Backend is running"}

    # Debug route to list all registered routes
    @app.route("/api/debug/routes")
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods - {'OPTIONS', 'HEAD'}),
                'path': rule.rule
            })
        return jsonify({'all_routes_count': len(routes), 'routes': routes})

    # ----------------------------
    # CLASS AND SUBJECT ALIAS ROUTES
    # ----------------------------
    @app.route("/api/classes", methods=["GET"])
    @jwt_required()
    def classes_alias():
        return get_classes()

    @app.route("/api/classes", methods=["POST"])
    @jwt_required()
    @admin_required
    def create_class_alias():
        return create_class()

    @app.route("/api/subjects", methods=["GET"])
    @jwt_required()
    def subjects_alias():
        return get_subjects()

    @app.route("/api/subjects", methods=["POST"])
    @jwt_required()
    @admin_required
    def create_subject_alias():
        return create_subject()

    return app
