from app import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Float, Numeric
from sqlalchemy.orm import relationship
from decimal import Decimal

class FeeStructure(db.Model):
    __tablename__ = 'fee_structures'
    
    id = Column(Integer, primary_key=True)
    course = Column(String(100), nullable=False)  # Course name (e.g., "Computer Science", "Engineering")
    academic_year = Column(String(10), nullable=False)
    semester = Column(String(50), nullable=False)  # e.g., "Fall 2024", "Spring 2025"
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    fee_items = relationship('FeeStructureItem', back_populates='fee_structure', cascade='all, delete-orphan')
    
    @property
    def total_mandatory_fees(self):
        return sum([item.amount for item in self.fee_items if item.is_mandatory and item.is_active])
    
    @property
    def total_optional_fees(self):
        return sum([item.amount for item in self.fee_items if not item.is_mandatory and item.is_active])
    
    @property
    def total_fees(self):
        return sum([item.amount for item in self.fee_items if item.is_active])
    
    def to_dict(self):
        return {
            'id': self.id,
            'course': self.course,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'name': self.name,
            'description': self.description,
            'total_mandatory_fees': float(self.total_mandatory_fees),
            'total_optional_fees': float(self.total_optional_fees),
            'total_fees': float(self.total_fees),
            'fee_items': [item.to_dict() for item in self.fee_items if item.is_active],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class FeeStructureItem(db.Model):
    __tablename__ = 'fee_structure_items'
    
    id = Column(Integer, primary_key=True)
    fee_structure_id = Column(Integer, ForeignKey('fee_structures.id'), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    fee_structure = relationship('FeeStructure', back_populates='fee_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'fee_structure_id': self.fee_structure_id,
            'category': self.category,
            'description': self.description,
            'amount': float(self.amount),
            'is_mandatory': self.is_mandatory,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FeeStatement(db.Model):
    __tablename__ = 'fee_statements'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    fee_structure_id = Column(Integer, ForeignKey('fee_structures.id'), nullable=False)
    statement_number = Column(String(50), unique=True, nullable=False)
    academic_year = Column(String(10), nullable=False)
    semester = Column(String(50), nullable=False)  # e.g., "Fall 2024", "Spring 2025"
    statement_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    paid_amount = Column(Numeric(10, 2), default=0)
    balance = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum('unpaid', 'partial', 'paid', 'overdue', name='payment_status'), default='unpaid')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', foreign_keys=[student_id])
    fee_structure = relationship('FeeStructure')
    payments = relationship('FeePayment', back_populates='fee_statement')
    
    def update_status(self):
        """Update payment status based on paid amount"""
        if self.paid_amount >= self.total_amount:
            self.status = 'paid'
            self.balance = 0
        elif self.paid_amount > 0:
            self.status = 'partial'
            self.balance = self.total_amount - self.paid_amount
        else:
            self.status = 'unpaid'
            self.balance = self.total_amount
            
        # Check if overdue
        if self.due_date < datetime.utcnow() and self.status != 'paid':
            self.status = 'overdue'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': f"{self.student.first_name} {self.student.last_name}" if self.student else None,
            'fee_structure_id': self.fee_structure_id,
            'statement_number': self.statement_number,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'statement_date': self.statement_date.isoformat() if self.statement_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'total_amount': float(self.total_amount),
            'paid_amount': float(self.paid_amount),
            'balance': float(self.balance),
            'status': self.status,
            'fee_structure': self.fee_structure.to_dict() if self.fee_structure else None,
            'payments': [payment.to_dict() for payment in self.payments],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class FeePayment(db.Model):
    __tablename__ = 'fee_payments'
    
    id = Column(Integer, primary_key=True)
    fee_statement_id = Column(Integer, ForeignKey('fee_statements.id'), nullable=False)
    payment_reference = Column(String(100), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum('cash', 'bank_transfer', 'mtn_mobile_money', 'airtel_money', 'card', name='payment_method'), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    transaction_id = Column(String(100))
    status = Column(Enum('pending', 'completed', 'failed', 'cancelled', name='transaction_status'), default='pending')
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    fee_statement = relationship('FeeStatement', back_populates='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'fee_statement_id': self.fee_statement_id,
            'payment_reference': self.payment_reference,
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
