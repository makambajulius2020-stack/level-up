from app import db
from datetime import datetime
from sqlalchemy import Enum
import enum

class EmployeeType(enum.Enum):
    teacher = "teacher"
    admin_staff = "admin_staff"
    support_staff = "support_staff"
    management = "management"

class PaymentMethod(enum.Enum):
    bank_transfer = "bank_transfer"
    cash = "cash"
    cheque = "cheque"
    mobile_money = "mobile_money"

class PaymentStatus(enum.Enum):
    pending = "pending"
    processed = "processed"
    paid = "paid"
    failed = "failed"

class PayrollEntry(db.Model):
    __tablename__ = 'payroll'
    
    id = db.Column(db.Integer, primary_key=True)
    payroll_number = db.Column(db.String(50), unique=True, nullable=False)
    employee_id = db.Column(db.Integer, nullable=False)
    employee_name = db.Column(db.String(255), nullable=False)
    employee_type = db.Column(Enum(EmployeeType), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(100), nullable=True)
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    basic_salary = db.Column(db.Numeric(12, 2), nullable=False)
    allowances = db.Column(db.Numeric(10, 2), default=0.00)
    overtime_hours = db.Column(db.Numeric(5, 2), default=0.00)
    overtime_rate = db.Column(db.Numeric(8, 2), default=0.00)
    overtime_pay = db.Column(db.Numeric(10, 2), default=0.00)
    bonuses = db.Column(db.Numeric(10, 2), default=0.00)
    deductions = db.Column(db.Numeric(10, 2), default=0.00)
    tax_deduction = db.Column(db.Numeric(10, 2), default=0.00)
    nssf_deduction = db.Column(db.Numeric(10, 2), default=0.00)
    gross_pay = db.Column(db.Numeric(12, 2), nullable=False)
    net_pay = db.Column(db.Numeric(12, 2), nullable=False)
    payment_method = db.Column(Enum(PaymentMethod), default=PaymentMethod.bank_transfer)
    payment_status = db.Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        super(PayrollEntry, self).__init__(**kwargs)
        if not self.payroll_number:
            self.payroll_number = f"PAY-{datetime.now().strftime('%Y%m%d')}-{self.id or 'NEW'}"

    def to_dict(self):
        return {
            'id': self.id,
            'payroll_number': self.payroll_number,
            'employee_id': self.employee_id,
            'employee_name': self.employee_name,
            'employee_type': self.employee_type.value if self.employee_type else None,
            'position': self.position,
            'department': self.department,
            'pay_period_start': self.pay_period_start.isoformat() if self.pay_period_start else None,
            'pay_period_end': self.pay_period_end.isoformat() if self.pay_period_end else None,
            'basic_salary': float(self.basic_salary) if self.basic_salary else 0.0,
            'allowances': float(self.allowances) if self.allowances else 0.0,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0.0,
            'overtime_rate': float(self.overtime_rate) if self.overtime_rate else 0.0,
            'overtime_pay': float(self.overtime_pay) if self.overtime_pay else 0.0,
            'bonuses': float(self.bonuses) if self.bonuses else 0.0,
            'deductions': float(self.deductions) if self.deductions else 0.0,
            'tax_deduction': float(self.tax_deduction) if self.tax_deduction else 0.0,
            'nssf_deduction': float(self.nssf_deduction) if self.nssf_deduction else 0.0,
            'gross_pay': float(self.gross_pay) if self.gross_pay else 0.0,
            'net_pay': float(self.net_pay) if self.net_pay else 0.0,
            'payment_method': self.payment_method.value if self.payment_method else None,
            'payment_status': self.payment_status.value if self.payment_status else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def calculate_gross_pay(self):
        """Calculate gross pay including basic salary, allowances, overtime, and bonuses"""
        basic = float(self.basic_salary) if self.basic_salary else 0.0
        allowances = float(self.allowances) if self.allowances else 0.0
        overtime = float(self.overtime_pay) if self.overtime_pay else 0.0
        bonuses = float(self.bonuses) if self.bonuses else 0.0
        
        return basic + allowances + overtime + bonuses

    def calculate_net_pay(self):
        """Calculate net pay after all deductions"""
        gross = self.calculate_gross_pay()
        deductions = float(self.deductions) if self.deductions else 0.0
        tax = float(self.tax_deduction) if self.tax_deduction else 0.0
        nssf = float(self.nssf_deduction) if self.nssf_deduction else 0.0
        
        return gross - deductions - tax - nssf

    def update_calculations(self):
        """Update calculated fields"""
        self.gross_pay = self.calculate_gross_pay()
        self.net_pay = self.calculate_net_pay()
        
        # Calculate overtime pay if not set
        if self.overtime_hours and self.overtime_rate and not self.overtime_pay:
            self.overtime_pay = float(self.overtime_hours) * float(self.overtime_rate)

    def __repr__(self):
        return f'<PayrollEntry {self.payroll_number} - {self.employee_name}>'
