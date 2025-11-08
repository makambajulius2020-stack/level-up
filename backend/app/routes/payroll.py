from flask import Blueprint, request, jsonify
from app.models.payroll import PayrollEntry, EmployeeType, PaymentMethod, PaymentStatus
from app import db
from datetime import datetime, date
from sqlalchemy import func, and_, or_
import uuid

payroll_bp = Blueprint('payroll', __name__, url_prefix='/api/payroll')

@payroll_bp.route('/', methods=['GET'])
def get_payroll():
    """Get all payroll records with optional filtering"""
    try:
        # Get query parameters
        month = request.args.get('month')
        status = request.args.get('status')
        employee_id = request.args.get('employee_id')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Build query
        query = PayrollEntry.query
        
        # Filter by month
        if month:
            year, month_num = month.split('-')
            start_date = date(int(year), int(month_num), 1)
            if int(month_num) == 12:
                end_date = date(int(year) + 1, 1, 1)
            else:
                end_date = date(int(year), int(month_num) + 1, 1)
            
            query = query.filter(
                and_(
                    PayrollEntry.pay_period_start >= start_date,
                    PayrollEntry.pay_period_start < end_date
                )
            )
        
        # Filter by status
        if status and status != 'all':
            query = query.filter(PayrollEntry.payment_status == PaymentStatus(status))
        
        # Filter by employee
        if employee_id:
            query = query.filter(PayrollEntry.employee_id == employee_id)
        
        # Paginate results
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        payroll_records = [record.to_dict() for record in pagination.items]
        
        # Calculate stats
        stats = calculate_payroll_stats(query)
        
        return jsonify({
            'success': True,
            'data': payroll_records,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            },
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching payroll records: {str(e)}'
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['GET'])
def get_payroll_by_id(payroll_id):
    """Get a specific payroll record by ID"""
    try:
        payroll = PayrollEntry.query.get_or_404(payroll_id)
        return jsonify({
            'success': True,
            'data': payroll.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching payroll record: {str(e)}'
        }), 500

@payroll_bp.route('/', methods=['POST'])
def create_payroll():
    """Create a new payroll record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['employee_id', 'employee_name', 'position', 'pay_period_start', 'pay_period_end', 'basic_salary']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Create new payroll entry
        payroll = PayrollEntry(
            employee_id=data['employee_id'],
            employee_name=data['employee_name'],
            employee_type=EmployeeType(data.get('employee_type', 'teacher')),
            position=data['position'],
            department=data.get('department'),
            pay_period_start=datetime.strptime(data['pay_period_start'], '%Y-%m-%d').date(),
            pay_period_end=datetime.strptime(data['pay_period_end'], '%Y-%m-%d').date(),
            basic_salary=data['basic_salary'],
            allowances=data.get('allowances', 0),
            overtime_hours=data.get('overtime_hours', 0),
            overtime_rate=data.get('overtime_rate', 0),
            bonuses=data.get('bonuses', 0),
            deductions=data.get('deductions', 0),
            tax_deduction=data.get('tax_deduction', 0),
            nssf_deduction=data.get('nssf_deduction', 0),
            payment_method=PaymentMethod(data.get('payment_method', 'bank_transfer')),
            notes=data.get('notes'),
            created_by=data.get('created_by', 1)  # Default to admin user
        )
        
        # Update calculations
        payroll.update_calculations()
        
        # Generate payroll number
        payroll.payroll_number = f"PAY-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        db.session.add(payroll)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payroll record created successfully',
            'data': payroll.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error creating payroll record: {str(e)}'
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['PUT'])
def update_payroll(payroll_id):
    """Update an existing payroll record"""
    try:
        payroll = PayrollEntry.query.get_or_404(payroll_id)
        data = request.get_json()
        
        # Update fields
        if 'employee_name' in data:
            payroll.employee_name = data['employee_name']
        if 'position' in data:
            payroll.position = data['position']
        if 'department' in data:
            payroll.department = data['department']
        if 'basic_salary' in data:
            payroll.basic_salary = data['basic_salary']
        if 'allowances' in data:
            payroll.allowances = data['allowances']
        if 'overtime_hours' in data:
            payroll.overtime_hours = data['overtime_hours']
        if 'overtime_rate' in data:
            payroll.overtime_rate = data['overtime_rate']
        if 'bonuses' in data:
            payroll.bonuses = data['bonuses']
        if 'deductions' in data:
            payroll.deductions = data['deductions']
        if 'tax_deduction' in data:
            payroll.tax_deduction = data['tax_deduction']
        if 'nssf_deduction' in data:
            payroll.nssf_deduction = data['nssf_deduction']
        if 'payment_method' in data:
            payroll.payment_method = PaymentMethod(data['payment_method'])
        if 'payment_status' in data:
            payroll.payment_status = PaymentStatus(data['payment_status'])
        if 'notes' in data:
            payroll.notes = data['notes']
        
        # Update calculations
        payroll.update_calculations()
        payroll.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payroll record updated successfully',
            'data': payroll.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error updating payroll record: {str(e)}'
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['DELETE'])
def delete_payroll(payroll_id):
    """Delete a payroll record"""
    try:
        payroll = PayrollEntry.query.get_or_404(payroll_id)
        db.session.delete(payroll)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payroll record deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting payroll record: {str(e)}'
        }), 500

@payroll_bp.route('/<int:payroll_id>/process', methods=['POST'])
def process_payment(payroll_id):
    """Process payment for a payroll record"""
    try:
        payroll = PayrollEntry.query.get_or_404(payroll_id)
        
        if payroll.payment_status == PaymentStatus.paid:
            return jsonify({
                'success': False,
                'message': 'Payment already processed'
            }), 400
        
        # Update payment status
        payroll.payment_status = PaymentStatus.processed
        payroll.payment_date = date.today()
        payroll.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment processed successfully',
            'data': payroll.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error processing payment: {str(e)}'
        }), 500

@payroll_bp.route('/stats', methods=['GET'])
def get_payroll_stats():
    """Get payroll statistics"""
    try:
        month = request.args.get('month')
        
        # Build query
        query = PayrollEntry.query
        
        # Filter by month if provided
        if month:
            year, month_num = month.split('-')
            start_date = date(int(year), int(month_num), 1)
            if int(month_num) == 12:
                end_date = date(int(year) + 1, 1, 1)
            else:
                end_date = date(int(year), int(month_num) + 1, 1)
            
            query = query.filter(
                and_(
                    PayrollEntry.pay_period_start >= start_date,
                    PayrollEntry.pay_period_start < end_date
                )
            )
        
        stats = calculate_payroll_stats(query)
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching payroll stats: {str(e)}'
        }), 500

@payroll_bp.route('/<int:payroll_id>/payslip', methods=['GET'])
def generate_payslip(payroll_id):
    """Generate payslip for a payroll record"""
    try:
        payroll = PayrollEntry.query.get_or_404(payroll_id)
        
        payslip_data = {
            'payroll_number': payroll.payroll_number,
            'employee_name': payroll.employee_name,
            'employee_id': payroll.employee_id,
            'position': payroll.position,
            'department': payroll.department,
            'pay_period': {
                'start': payroll.pay_period_start.isoformat(),
                'end': payroll.pay_period_end.isoformat()
            },
            'earnings': {
                'basic_salary': float(payroll.basic_salary),
                'allowances': float(payroll.allowances),
                'overtime_pay': float(payroll.overtime_pay),
                'bonuses': float(payroll.bonuses),
                'gross_pay': float(payroll.gross_pay)
            },
            'deductions': {
                'tax_deduction': float(payroll.tax_deduction),
                'nssf_deduction': float(payroll.nssf_deduction),
                'other_deductions': float(payroll.deductions),
                'total_deductions': float(payroll.tax_deduction + payroll.nssf_deduction + payroll.deductions)
            },
            'net_pay': float(payroll.net_pay),
            'payment_method': payroll.payment_method.value if payroll.payment_method else None,
            'payment_status': payroll.payment_status.value if payroll.payment_status else None,
            'generated_date': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': payslip_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating payslip: {str(e)}'
        }), 500

def calculate_payroll_stats(query):
    """Calculate payroll statistics from query"""
    try:
        # Total employees
        total_employees = query.count()
        
        # Total payroll amount
        total_payroll = query.with_entities(func.sum(PayrollEntry.gross_pay)).scalar() or 0
        
        # Processed payroll count
        processed_payroll = query.filter(PayrollEntry.payment_status == PaymentStatus.processed).count()
        
        # Pending payroll count
        pending_payroll = query.filter(PayrollEntry.payment_status == PaymentStatus.pending).count()
        
        # Average salary
        avg_salary = query.with_entities(func.avg(PayrollEntry.basic_salary)).scalar() or 0
        
        return {
            'totalEmployees': total_employees,
            'totalPayroll': float(total_payroll),
            'processedPayroll': processed_payroll,
            'pendingPayroll': pending_payroll,
            'averageSalary': float(avg_salary)
        }
    except Exception as e:
        return {
            'totalEmployees': 0,
            'totalPayroll': 0,
            'processedPayroll': 0,
            'pendingPayroll': 0,
            'averageSalary': 0
        }
