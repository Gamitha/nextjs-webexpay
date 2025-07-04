import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger, PerformanceTimer, withLogging } from '@/lib/logger';

// Validate required environment variables
function validateEnvironmentVariables(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredEnvVars = {
    WEBX_PAY_CHECKOUT_URL: process.env.WEBX_PAY_CHECKOUT_URL,
    WEBX_PAY_SECRET_KEY: process.env.WEBX_PAY_SECRET_KEY,
    WEBX_PAY_PUBLIC_KEY: process.env.WEBX_PAY_PUBLIC_KEY,
    WEBX_PAY_ENC_METHOD: process.env.WEBX_PAY_ENC_METHOD,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  };

  // Check for missing environment variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim().length === 0) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate URL format for checkout URL
  if (requiredEnvVars.WEBX_PAY_CHECKOUT_URL) {
    try {
      new URL(requiredEnvVars.WEBX_PAY_CHECKOUT_URL);
    } catch {
      errors.push('WEBX_PAY_CHECKOUT_URL must be a valid URL');
    }
  }

  // Validate URL format for base URL
  if (requiredEnvVars.NEXT_PUBLIC_BASE_URL) {
    try {
      new URL(requiredEnvVars.NEXT_PUBLIC_BASE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_BASE_URL must be a valid URL');
    }
  }

  // Validate RSA public key format
  if (requiredEnvVars.WEBX_PAY_PUBLIC_KEY) {
    if (!requiredEnvVars.WEBX_PAY_PUBLIC_KEY.includes('BEGIN PUBLIC KEY') || 
        !requiredEnvVars.WEBX_PAY_PUBLIC_KEY.includes('END PUBLIC KEY')) {
      errors.push('WEBX_PAY_PUBLIC_KEY must be a valid RSA public key');
    }
  }

  // Validate secret key length
  if (requiredEnvVars.WEBX_PAY_SECRET_KEY && requiredEnvVars.WEBX_PAY_SECRET_KEY.length < 10) {
    errors.push('WEBX_PAY_SECRET_KEY must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// WebX Pay configuration - Based on original PHP implementation
// Non-null assertions are safe here because we validate environment variables before use
const WEBX_PAY_CONFIG = {
  // Production URL - change to sandbox URL for testing
  checkoutUrl: process.env.WEBX_PAY_CHECKOUT_URL!,
  
  // WebX Pay credentials from original PHP code
  secretKey: process.env.WEBX_PAY_SECRET_KEY!,
  
  // WebX Pay RSA Public Key for encryption (from original PHP)
  publicKey: process.env.WEBX_PAY_PUBLIC_KEY!,
  
  // Encryption method identifier (from original PHP)
  encMethod: process.env.WEBX_PAY_ENC_METHOD!,
  
  // Success and failure URLs - update these to your actual URLs
  successUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  failureUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  
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
    logger.debug('Starting payment data encryption', {
      plaintextLength: plaintext.length,
      publicKeyLength: publicKey.length
    });
    
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    
    const encryptedBase64 = encrypted.toString('base64');
    
    logger.debug('Payment data encryption completed', {
      encryptedLength: encryptedBase64.length
    });
    
    return encryptedBase64;
  } catch (error) {
    logger.error('Payment data encryption failed', error as Error, {
      plaintextLength: plaintext.length,
      publicKeyLength: publicKey.length
    });
    throw new Error(`Failed to encrypt payment data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  const timer = new PerformanceTimer('payment_processing');
  
  try {
    // Validate environment variables first
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      logger.error('Environment validation failed', new Error('Missing required environment variables'), {
        errors: envValidation.errors
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          message: 'Payment service is not properly configured. Please contact support.',
          // Only include detailed errors in development
          ...(process.env.NODE_ENV === 'development' && { 
            configurationErrors: envValidation.errors 
          })
        },
        { status: 500 }
      );
    }

    const formData: PaymentData = await request.json();
    
    // Log payment initiation
    logger.paymentInitiated(
      formData.orderId || 'pending',
      formData.amount,
      formData.processCurrency,
      request
    );
    
    // Validate payment data
    const validation = validatePaymentData(formData);
    if (!validation.isValid) {
      logger.validationError(
        'Payment validation failed',
        validation.errors,
        request
      );
      
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
    
    // Log order ID generation
    logger.info('Order ID generated', {
      orderId,
      amount: formData.amount,
      currency: formData.processCurrency,
      customerEmail: formData.email
    });
    
    // Prepare plaintext for encryption: unique_order_id|total_amount (original PHP format)
    const plaintext = `${orderId}|${formData.amount}`;
    
    // Encrypt payment data using RSA public key with logging
    const encryptedPayment = await withLogging(
      'payment_encryption',
      async () => encryptPaymentData(plaintext, WEBX_PAY_CONFIG.publicKey),
      { orderId, plaintextLength: plaintext.length }
    );
    
    // Log successful encryption
    logger.paymentDataPrepared(
      orderId,
      formData.amount,
      formData.processCurrency,
      encryptedPayment.length
    );
    
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
    
    // Log payment redirect
    logger.paymentRedirect(orderId, WEBX_PAY_CONFIG.checkoutUrl);
    
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
    
    // Log successful payment preparation
    logger.audit('Payment preparation completed', {
      orderId,
      amount: formData.amount,
      currency: formData.processCurrency,
      customerEmail: formData.email,
      encryptedPaymentLength: encryptedPayment.length
    });
    
    // TODO: insert payment data into database here if needed
 

    return NextResponse.json(paymentResponse);
    
  } catch (error) {
    logger.error('Payment processing failed', error as Error, {
      url: request.url,
      method: request.method
    });
    
    // Log encryption specific errors
    if (error instanceof Error && error.message.includes('encrypt')) {
      logger.encryptionError('unknown', error as Error);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'An error occurred while processing your payment. Please try again.'
      },
      { status: 500 }
    );
  } finally {
    timer.end();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Payment API endpoint. Use POST to process payments.' 
  });
}
