"""
Payment Gateway Services for Uganda
Supports MTN MoMo, Airtel Money, Stripe, and Banking integrations
"""
import logging
import requests
import hashlib
import hmac
import json
from datetime import datetime
from app import db
from app.models.payment import Payment, PaymentGatewayConfig
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class PaymentGatewayService:
    def __init__(self):
        self.notification_service = NotificationService()
    
    def initiate_payment(self, user_id, amount, method, student_id=None, fee_type='tuition', description=None, course_id=None, metadata=None):
        """
        Initiate payment through specified gateway
        
        Args:
            user_id (int): User making the payment
            amount (float): Amount in UGX
            method (str): Payment method (mtn_momo, airtel_money, stripe, bank)
            student_id (str): Student ID for parent payments
            fee_type (str): Type of fee being paid
            description (str): Payment description
            
        Returns:
            dict: Payment initiation response
        """
        try:
            # Create payment record
            payment = Payment(
                user_id=user_id,
                student_id=student_id,
                amount=amount,
                currency='UGX',
                method=method,
                status='pending',
                fee_type=fee_type,
                description=description,
                academic_term='Semester 1',  # Would be dynamic in real system
                academic_year='2024'
            )
            
            # Store course_id and additional metadata in notes field as JSON
            if course_id or metadata:
                metadata_dict = {'course_id': course_id} if course_id else {}
                if metadata:
                    metadata_dict.update(metadata)
                payment.notes = json.dumps(metadata_dict)
            
            db.session.add(payment)
            db.session.flush()  # Get payment ID
            
            # Route to appropriate gateway
            if method == 'mtn_momo':
                result = self._process_mtn_momo(payment)
            elif method == 'airtel_money':
                result = self._process_airtel_money(payment)
            elif method == 'stripe':
                result = self._process_stripe(payment)
            elif method == 'bank':
                result = self._process_bank_transfer(payment)
            else:
                raise ValueError(f"Unsupported payment method: {method}")
            
            # Update payment with gateway response
            payment.gateway_transaction_id = result.get('transaction_id')
            payment.gateway_reference = result.get('reference')
            payment.gateway_response = json.dumps(result)
            
            if result.get('success'):
                payment.status = 'processing'
            else:
                payment.status = 'failed'
            
            db.session.commit()
            
            return {
                'success': result.get('success', False),
                'payment_id': payment.id,
                'transaction_id': result.get('transaction_id'),
                'reference': result.get('reference'),
                'message': result.get('message'),
                'payment_url': result.get('payment_url'),
                'instructions': result.get('instructions')
            }
            
        except Exception as e:
            logger.error(f"Payment initiation error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Payment initiation failed',
                'error': str(e)
            }

class MTNMoMoGateway:
    def __init__(self):
        self.base_url = "https://sandbox.momodeveloper.mtn.com"  # Use production URL in live
        self.subscription_key = "your_mtn_subscription_key"
        self.api_user = "your_api_user"
        self.api_key = "your_api_key"
    
    def request_payment(self, payment):
        """Request payment from MTN MoMo"""
        try:
            # Generate access token
            token = self._get_access_token()
            if not token:
                return {'success': False, 'message': 'Failed to authenticate with MTN MoMo'}
            
            # Prepare payment request
            reference_id = f"PAY_{payment.id}_{int(datetime.now().timestamp())}"
            
            headers = {
                'Authorization': f'Bearer {token}',
                'X-Reference-Id': reference_id,
                'X-Target-Environment': 'sandbox',  # Change to 'live' for production
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': self.subscription_key
            }
            
            payload = {
                'amount': str(int(payment.amount)),
                'currency': 'UGX',
                'externalId': str(payment.id),
                'payer': {
                    'partyIdType': 'MSISDN',
                    'partyId': '256700000000'  # Would be user's phone number
                },
                'payerMessage': f'School fees payment - {payment.fee_type}',
                'payeeNote': f'Payment for {payment.description or payment.fee_type}'
            }
            
            response = requests.post(
                f"{self.base_url}/collection/v1_0/requesttopay",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 202:
                return {
                    'success': True,
                    'transaction_id': reference_id,
                    'reference': reference_id,
                    'message': 'Payment request sent to MTN MoMo. Please check your phone.',
                    'instructions': 'Check your phone for MTN MoMo payment prompt and enter your PIN to complete payment.'
                }
            else:
                logger.error(f"MTN MoMo API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'message': 'MTN MoMo payment request failed',
                    'error': response.text
                }
                
        except Exception as e:
            logger.error(f"MTN MoMo payment error: {str(e)}")
            return {
                'success': False,
                'message': 'MTN MoMo service unavailable',
                'error': str(e)
            }
    
    def _get_access_token(self):
        """Get OAuth access token from MTN MoMo"""
        try:
            headers = {
                'Ocp-Apim-Subscription-Key': self.subscription_key,
                'Authorization': f'Basic {self._encode_credentials()}'
            }
            
            response = requests.post(
                f"{self.base_url}/collection/token/",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            return None
            
        except Exception as e:
            logger.error(f"MTN MoMo token error: {str(e)}")
            return None
    
    def _encode_credentials(self):
        """Encode API credentials for basic auth"""
        import base64
        credentials = f"{self.api_user}:{self.api_key}"
        return base64.b64encode(credentials.encode()).decode()

class AirtelMoneyGateway:
    def __init__(self):
        self.base_url = "https://openapiuat.airtel.africa"  # Use production URL in live
        self.client_id = "your_airtel_client_id"
        self.client_secret = "your_airtel_client_secret"
    
    def request_payment(self, payment):
        """Request payment from Airtel Money"""
        try:
            # Get access token
            token = self._get_access_token()
            if not token:
                return {'success': False, 'message': 'Failed to authenticate with Airtel Money'}
            
            reference_id = f"AIRTEL_{payment.id}_{int(datetime.now().timestamp())}"
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Country': 'UG',
                'X-Currency': 'UGX'
            }
            
            payload = {
                'reference': reference_id,
                'subscriber': {
                    'country': 'UG',
                    'currency': 'UGX',
                    'msisdn': '256700000000'  # Would be user's phone number
                },
                'transaction': {
                    'amount': payment.amount,
                    'country': 'UG',
                    'currency': 'UGX',
                    'id': str(payment.id)
                }
            }
            
            response = requests.post(
                f"{self.base_url}/merchant/v1/payments/",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'transaction_id': result.get('transaction', {}).get('id'),
                    'reference': reference_id,
                    'message': 'Payment request sent to Airtel Money. Please check your phone.',
                    'instructions': 'Check your phone for Airtel Money payment prompt and enter your PIN.'
                }
            else:
                logger.error(f"Airtel Money API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'message': 'Airtel Money payment request failed',
                    'error': response.text
                }
                
        except Exception as e:
            logger.error(f"Airtel Money payment error: {str(e)}")
            return {
                'success': False,
                'message': 'Airtel Money service unavailable',
                'error': str(e)
            }
    
    def _get_access_token(self):
        """Get OAuth access token from Airtel Money"""
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            payload = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'grant_type': 'client_credentials'
            }
            
            response = requests.post(
                f"{self.base_url}/auth/oauth2/token",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            return None
            
        except Exception as e:
            logger.error(f"Airtel Money token error: {str(e)}")
            return None

class StripeGateway:
    def __init__(self):
        self.secret_key = "sk_test_your_stripe_secret_key"  # Use live key in production
        self.publishable_key = "pk_test_your_stripe_publishable_key"
    
    def create_payment_intent(self, payment):
        """Create Stripe payment intent"""
        try:
            import stripe
            stripe.api_key = self.secret_key
            
            # Convert UGX to smallest currency unit (cents)
            amount_cents = int(payment.amount * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='ugx',
                metadata={
                    'payment_id': payment.id,
                    'student_id': payment.student_id,
                    'fee_type': payment.fee_type
                },
                description=f"School fees payment - {payment.fee_type}"
            )
            
            return {
                'success': True,
                'transaction_id': intent.id,
                'reference': intent.id,
                'message': 'Payment intent created successfully',
                'client_secret': intent.client_secret,
                'payment_url': f"https://checkout.stripe.com/pay/{intent.id}"
            }
            
        except Exception as e:
            logger.error(f"Stripe payment error: {str(e)}")
            return {
                'success': False,
                'message': 'Stripe payment creation failed',
                'error': str(e)
            }

class BankingGateway:
    def __init__(self):
        self.supported_banks = [
            'stanbic', 'centenary', 'equity', 'dfcu', 'absa'
        ]
    
    def generate_payment_reference(self, payment, bank_code):
        """Generate bank payment reference"""
        try:
            if bank_code not in self.supported_banks:
                return {
                    'success': False,
                    'message': f'Bank {bank_code} not supported'
                }
            
            reference = f"{bank_code.upper()}{payment.id:06d}{int(datetime.now().timestamp())}"
            
            # Bank account details (would be configured per school)
            bank_details = {
                'stanbic': {
                    'account_name': 'Smart School Limited',
                    'account_number': '9030012345678',
                    'bank_name': 'Stanbic Bank Uganda',
                    'swift_code': 'SBICUGKX'
                },
                'centenary': {
                    'account_name': 'Smart School Limited',
                    'account_number': '3100012345678',
                    'bank_name': 'Centenary Bank',
                    'swift_code': 'CENTUGGX'
                },
                'equity': {
                    'account_name': 'Smart School Limited',
                    'account_number': '1234567890123',
                    'bank_name': 'Equity Bank Uganda',
                    'swift_code': 'EQBLUGKA'
                }
            }
            
            bank_info = bank_details.get(bank_code, bank_details['stanbic'])
            
            return {
                'success': True,
                'transaction_id': reference,
                'reference': reference,
                'message': 'Bank payment reference generated',
                'bank_details': bank_info,
                'instructions': f"""
                Please transfer UGX {payment.amount:,.0f} to:
                
                Bank: {bank_info['bank_name']}
                Account Name: {bank_info['account_name']}
                Account Number: {bank_info['account_number']}
                Reference: {reference}
                
                Please use the reference number when making the transfer.
                Payment will be verified within 24 hours.
                """
            }
            
        except Exception as e:
            logger.error(f"Banking gateway error: {str(e)}")
            return {
                'success': False,
                'message': 'Bank payment reference generation failed',
                'error': str(e)
            }

# Main payment service that uses the gateways
class PaymentGatewayService:
    def __init__(self):
        self.mtn_gateway = MTNMoMoGateway()
        self.airtel_gateway = AirtelMoneyGateway()
        self.stripe_gateway = StripeGateway()
        self.banking_gateway = BankingGateway()
        self.notification_service = NotificationService()
    
    def _process_mtn_momo(self, payment):
        """Process MTN MoMo payment"""
        return self.mtn_gateway.request_payment(payment)
    
    def _process_airtel_money(self, payment):
        """Process Airtel Money payment"""
        return self.airtel_gateway.request_payment(payment)
    
    def _process_stripe(self, payment):
        """Process Stripe payment"""
        return self.stripe_gateway.create_payment_intent(payment)
    
    def _process_bank_transfer(self, payment):
        """Process bank transfer"""
        return self.banking_gateway.generate_payment_reference(payment, 'stanbic')
    
    def handle_webhook(self, gateway, payload, signature=None):
        """Handle payment gateway webhooks"""
        try:
            if gateway == 'mtn_momo':
                return self._handle_mtn_webhook(payload)
            elif gateway == 'airtel_money':
                return self._handle_airtel_webhook(payload)
            elif gateway == 'stripe':
                return self._handle_stripe_webhook(payload, signature)
            else:
                return {'success': False, 'message': 'Unknown gateway'}
                
        except Exception as e:
            logger.error(f"Webhook handling error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _handle_mtn_webhook(self, payload):
        """Handle MTN MoMo webhook"""
        # Implementation for MTN MoMo webhook verification and processing
        return {'success': True, 'message': 'MTN webhook processed'}
    
    def _handle_airtel_webhook(self, payload):
        """Handle Airtel Money webhook"""
        # Implementation for Airtel Money webhook verification and processing
        return {'success': True, 'message': 'Airtel webhook processed'}
    
    def _handle_stripe_webhook(self, payload, signature):
        """Handle Stripe webhook"""
        # Implementation for Stripe webhook verification and processing
        return {'success': True, 'message': 'Stripe webhook processed'}
