from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Complaint

complaints_bp = Blueprint('complaints', __name__)

@complaints_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def list_complaints():
    items = Complaint.query.order_by(Complaint.created_at.desc()).limit(200).all()
    return jsonify({'success': True, 'items': [i.to_dict() for i in items]})

@complaints_bp.route('/', methods=['POST'])
@jwt_required()
def create_complaint():
    data = request.get_json() or {}
    try:
        current_user = get_jwt_identity()
        created_by = current_user['id'] if isinstance(current_user, dict) and 'id' in current_user else None
    except Exception:
        created_by = None

    comp = Complaint(
        created_by=created_by,
        target_user_id=data.get('target_user_id'),
        category=data.get('category', 'other'),
        title=data.get('title', 'Untitled Complaint'),
        description=data.get('description', ''),
        priority=data.get('priority', 'normal'),
    )
    db.session.add(comp)
    db.session.commit()
    return jsonify({'success': True, 'item': comp.to_dict()}), 201

@complaints_bp.route('/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_complaint(item_id):
    data = request.get_json() or {}
    comp = Complaint.query.get_or_404(item_id)
    for field in ['status', 'priority', 'resolution_notes', 'title', 'description', 'category']:
        if field in data:
            setattr(comp, field, data[field])
    db.session.commit()
    return jsonify({'success': True, 'item': comp.to_dict()})
