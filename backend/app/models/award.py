from app import db
from datetime import datetime

class Award(db.Model):
    __tablename__ = 'awards'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    recipient_class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=True)
    category = db.Column(db.String(50), nullable=False)  # academic, sports, behavior, leadership, other
    awarded_on = db.Column(db.Date, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'recipient_user_id': self.recipient_user_id,
            'recipient_class_id': self.recipient_class_id,
            'category': self.category,
            'awarded_on': self.awarded_on.isoformat() if self.awarded_on else None,
            'created_by': self.created_by,
        }
