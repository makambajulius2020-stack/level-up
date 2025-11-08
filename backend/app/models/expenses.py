from app import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(db.String(50), default='Bank Transfer')
    vendor = db.Column(db.String(200), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    receipt_number = db.Column(db.String(50), unique=True)
    status = db.Column(db.String(20), default='pending')  # pending, approved, paid, rejected
    approved_by = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Expense {self.description[:50]}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'category': self.category,
            'amount': float(self.amount) if self.amount else 0,
            'date': self.date.isoformat() if self.date else None,
            'payment_method': self.payment_method,
            'vendor': self.vendor,
            'department': self.department,
            'receipt_number': self.receipt_number,
            'status': self.status,
            'approved_by': self.approved_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
