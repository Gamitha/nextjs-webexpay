import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// WebX Pay configuration - Based on original PHP implementation
const WEBX_PAY_CONFIG = {
  // Production URL - change to sandbox URL for testing
  checkoutUrl: 'https://stagingxpay.info/index.php?route=checkout/billing',
  
  // WebX Pay credentials from original PHP code
  secretKey: 'b7b682c3-3640-424d-b1ea-e600cda8e1a6',
  
  // WebX Pay RSA Public Key for encryption (from original PHP)
  publicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxEpnv0K4RvjPn5t5B5T3ikHnZ
0rugXpFHk8HbuPnbh33TZnw6Ny4vojKnPbkafw8NLXPZwYtt8lApCOUzPcob9anZ
GkD4WFlsJ8pp5/rmvfZ0zNGsvaxnDoiOylq6Dyai4SsRKpfn3EnqDDE8JTSE36eB
UYDeURgL1lCi5XuhkQIDAQAB
-----END PUBLIC KEY-----`,
  
  // Encryption method identifier (from original PHP)
  encMethod: 'JCs3J+6oSz4V0LgE0zi/Bg==',
  
  // Success and failure URLs - update these to your actual URLs
  successUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  failureUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  
  // Currency codes supported by WebX Pay
  supportedCurrencies: ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']
};

interface PaymentData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  processCurrency: string;
  paymentGatewayId: string;
  multiplePaymentGatewayIds: string;
  amount: number;
  orderId?: string;
  description?: string;
}

// WebX Pay form data interface - Based on original PHP implementation
interface WebXPayFormData {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  address_line_one: string;
  address_line_two: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  process_currency: string;
  payment_gateway_id: string;
  multiple_payment_gateway_ids: string;
  cms: string;
  custom_fields: string;
  enc_method: string;
  secret_key: string;
  payment: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
}

// Generate unique order ID following original PHP format
function generateOrderId(): string {
  const timestamp = Date.now();
  return `${timestamp}`;
}

// Encrypt payment data using RSA public key (as per original PHP implementation)
function encryptPaymentData(plaintext: string, publicKey: string): string {
  try {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    
    return encrypted.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt payment data');
  }
}

// Prepare custom fields as per original PHP implementation
function prepareCustomFields(formData: PaymentData): string {
  // Original PHP: cus_1|cus_2|cus_3|cus_4
  const customFields = [
    `name:${formData.firstName} ${formData.lastName}`,
    `email:${formData.email}`,
    `phone:${formData.contactNumber}`,
    `address:${formData.addressLineOne}, ${formData.city}`
  ].join('|');
  
  return Buffer.from(customFields, 'utf8').toString('base64');
}

// Validate payment data
function validatePaymentData(formData: PaymentData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!formData.firstName || formData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (!formData.lastName || formData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!formData.contactNumber || formData.contactNumber.trim().length < 10) {
    errors.push('Valid contact number is required');
  }
  
  if (!formData.amount || formData.amount < 100) {
    errors.push('Minimum amount is 100 cents (1.00)');
  }
  
  if (!formData.processCurrency || !WEBX_PAY_CONFIG.supportedCurrencies.includes(formData.processCurrency)) {
    errors.push('Supported currencies: ' + WEBX_PAY_CONFIG.supportedCurrencies.join(', '));
  }
  
  if (!formData.addressLineOne || formData.addressLineOne.trim().length < 5) {
    errors.push('Address line 1 must be at least 5 characters long');
  }
  
  if (!formData.city || formData.city.trim().length < 2) {
    errors.push('City is required');
  }
  
  if (!formData.country || formData.country.trim().length < 2) {
    errors.push('Country is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData: PaymentData = await request.json();
    
    // Validate payment data
    const validation = validatePaymentData(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: validation.errors.join(', '),
          errors: validation.errors
        },
        { status: 400 }
      );
    }
    
    // Generate unique order ID (as per original PHP)
    const orderId = formData.orderId || generateOrderId();
    
    // Prepare plaintext for encryption: unique_order_id|total_amount (original PHP format)
    const plaintext = `${orderId}|${formData.amount}`;
    
    console.log('Processing WebX Pay payment:', {
      orderId,
      amount: formData.amount,
      currency: formData.processCurrency,
      customer: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      plaintext: plaintext
    });
    
    // Encrypt payment data using RSA public key (exactly like original PHP)
    const encryptedPayment = encryptPaymentData(plaintext, WEBX_PAY_CONFIG.publicKey);
    
    // Prepare custom fields (exactly like original PHP)
    const customFields = prepareCustomFields(formData);
    
    // Prepare WebX Pay form data (exactly like original PHP)
    const webxPayFormData: WebXPayFormData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      contact_number: formData.contactNumber,
      address_line_one: formData.addressLineOne,
      address_line_two: formData.addressLineTwo,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
      country: formData.country,
      process_currency: formData.processCurrency,
      payment_gateway_id: formData.paymentGatewayId,
      multiple_payment_gateway_ids: formData.multiplePaymentGatewayIds,
      cms: 'Next.js',
      custom_fields: customFields,
      enc_method: WEBX_PAY_CONFIG.encMethod,
      secret_key: WEBX_PAY_CONFIG.secretKey,
      payment: encryptedPayment,
      return_url: `${WEBX_PAY_CONFIG.successUrl}/payment-success`,
      cancel_url: `${WEBX_PAY_CONFIG.failureUrl}/payment-failure`,
      notify_url: `${WEBX_PAY_CONFIG.successUrl}/api/payment/webhook`
    };
    
    console.log('WebX Pay form data prepared:', {
      order_id: orderId,
      amount: formData.amount,
      currency: formData.processCurrency,
      encrypted_payment_length: encryptedPayment.length,
      custom_fields_length: customFields.length,
      secret_key: WEBX_PAY_CONFIG.secretKey,
      enc_method: WEBX_PAY_CONFIG.encMethod,
      checkout_url: WEBX_PAY_CONFIG.checkoutUrl
    });
    
    const paymentResponse = {
      success: true,
      orderId: orderId,
      amount: formData.amount,
      currency: formData.processCurrency,
      checkoutUrl: WEBX_PAY_CONFIG.checkoutUrl,
      
      // WebX Pay form data (matching what the frontend expects)
      webxPayData: webxPayFormData,
      formData: webxPayFormData, // Backward compatibility
      
      encryptedPayment: encryptedPayment,
      plaintext: plaintext, // For debugging
      message: 'Payment data prepared successfully for WebX Pay',
      
      // Add redirect information
      redirectToWebXPay: true,
      webxPayUrl: WEBX_PAY_CONFIG.checkoutUrl
    };
    
    return NextResponse.json(paymentResponse);
    
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'An error occurred while processing your payment. Please try again.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Payment API endpoint. Use POST to process payments.' 
  });
}
