from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Award
from datetime import datetime

awards_bp = Blueprint('awards', __name__)

@awards_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def list_awards():
    items = Award.query.order_by(Award.awarded_on.desc()).limit(200).all()
    return jsonify({'success': True, 'items': [i.to_dict() for i in items]})

@awards_bp.route('/', methods=['POST'])
@jwt_required()
def create_award():
    data = request.get_json() or {}
    awarded_on = datetime.strptime(data.get('awarded_on', datetime.utcnow().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
    a = Award(
        title=data['title'],
        description=data.get('description'),
        recipient_user_id=data.get('recipient_user_id'),
        recipient_class_id=data.get('recipient_class_id'),
        category=data.get('category','other'),
        awarded_on=awarded_on,
        created_by=data.get('created_by')
    )
    db.session.add(a)
    db.session.commit()
    return jsonify({'success': True, 'item': a.to_dict()}), 201
