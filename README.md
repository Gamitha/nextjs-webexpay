# WebX Pay Integration - Production-Ready Implementation

This project implements a complete WebX Pay integration based on the official WebX Pay integration guide V2.7, with production-grade logging, monitoring, and security features.

## 🚀 Features

### 1. **Official WebX Pay Implementation**
- ✅ **Standard Form Fields**: All required WebX Pay fields implemented
- ✅ **RSA Encryption**: Secure payment data encryption
- ✅ **Webhook Support**: Real-time payment status updates with proper parsing
- ✅ **Multi-Currency**: Support for LKR, USD, EUR, GBP, INR, AUD, CAD
- ✅ **Status Code Handling**: Proper WebX Pay status code processing

### 2. **Production-Grade Logging**
- ✅ **Structured Logging**: JSON-formatted logs with contextual information
- ✅ **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, SECURITY, AUDIT
- ✅ **Payment Audit Trail**: Complete transaction logging for compliance
- ✅ **Performance Metrics**: Request timing and performance monitoring
- ✅ **Error Tracking**: Detailed error logging with stack traces
- ✅ **Security Logging**: Security event detection and alerting
- ✅ **Data Sanitization**: Automatic PII and sensitive data masking

### 3. **Security Features**
- ✅ **Data Encryption**: RSA encryption for payment data
- ✅ **Input Validation**: Comprehensive form validation
- ✅ **Environment Variables**: Secure credential management
- ✅ **Error Handling**: Secure error handling without data exposure
- ✅ **PII Protection**: GDPR-compliant data handling and masking

### 4. **Monitoring & Health Checks**
- ✅ **Health Check API**: System health monitoring endpoint
- ✅ **Environment Validation**: Startup validation of all required configuration
- ✅ **Performance Monitoring**: Request timing and performance metrics
- ✅ **Webhook Monitoring**: Webhook processing status and metrics
- ✅ **Encryption Service Check**: RSA encryption service validation
- ✅ **Connectivity Tests**: WebX Pay endpoint connectivity checks

### 5. **Modern UI/UX**
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Loading States**: Visual feedback during processing
- ✅ **Success/Failure Pages**: Clear payment status indication
- ✅ **Dark Mode Support**: Automatic theme adaptation
- ✅ **Accessibility**: WCAG compliant form elements

## 📋 WebX Pay Integration Features

### Core Implementation
- **Environment Validation**: Comprehensive validation of all required environment variables
- **RSA Encryption**: Secure payment data encryption using WebX Pay's public key
- **Webhook Processing**: Real-time payment status updates with proper status code handling
- **Multi-Currency Support**: Support for LKR, USD, EUR, GBP, INR, AUD, CAD
- **Status Code Processing**: Proper handling of WebX Pay status codes ('00' = success, others = failure)
- **Form Data Validation**: Comprehensive client and server-side validation
- **Custom Fields Encoding**: Base64 encoding of custom fields as per WebX Pay specification

### Required Environment Variables
- `WEBX_PAY_CHECKOUT_URL` - WebX Pay checkout endpoint URL
- `WEBX_PAY_SECRET_KEY` - WebX Pay secret key for authentication
- `WEBX_PAY_PUBLIC_KEY` - RSA public key for payment data encryption
- `WEBX_PAY_ENC_METHOD` - Encryption method identifier
- `NEXT_PUBLIC_BASE_URL` - Application base URL for redirects

### WebX Pay Form Fields

### Required Fields
- `merchant_id` - Your WebX Pay merchant ID
- `order_id` - Unique order identifier
- `amount` - Payment amount in major currency units
- `currency` - Payment currency code
- `hash` - Authentication hash
- `first_name` - Customer first name
- `last_name` - Customer last name
- `email` - Customer email address
- `phone` - Customer phone number
- `address` - Customer address
- `city` - Customer city
- `country` - Customer country

### Optional Fields
- `state` - Customer state/province
- `postal_code` - Customer postal code
- `items` - JSON string of items
- `custom_1` to `custom_4` - Custom data fields
- `return_url` - Success redirect URL
- `cancel_url` - Failure redirect URL
- `notify_url` - Webhook notification URL

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with your WebX Pay credentials:

```env
# WebX Pay Configuration
WEBX_PAY_CHECKOUT_URL=https://webxpay.com/index.php?route=checkout/billing
WEBX_PAY_SECRET_KEY=630be963-59e2-447a-8f3b-93b3d7a3bf25
WEBX_PAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9l2HykxDIDVZeyDPJU4pA0imf
3nWsvyJgb3zTsnN8B0mFX6u5squ5NQcnQ03L8uQ56b4/isHBgiyKwfMr4cpEpCTY
/t1WSdJ5EokCI/F7hCM7aSSSY85S7IYOiC6pKR4WbaOYMvAMKn5gCobEPtosmPLz
gh8Lo3b8UsjPq2W26QIDAQAB
-----END PUBLIC KEY-----"
WEBX_PAY_ENC_METHOD=JCs3J+6oSz4V0LgE0zi/Bg==

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Environment Variable Validation
The application includes comprehensive environment variable validation to ensure all required WebX Pay configuration is present:

```typescript
function validateEnvironmentVariables(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredEnvVars = {
    WEBX_PAY_CHECKOUT_URL: process.env.WEBX_PAY_CHECKOUT_URL,
    WEBX_PAY_SECRET_KEY: process.env.WEBX_PAY_SECRET_KEY,
    WEBX_PAY_PUBLIC_KEY: process.env.WEBX_PAY_PUBLIC_KEY,
    WEBX_PAY_ENC_METHOD: process.env.WEBX_PAY_ENC_METHOD,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  };

  // Validates:
  // ✅ All required variables are present
  // ✅ URL format validation for checkout and base URLs
  // ✅ RSA public key format validation
  // ✅ Secret key minimum length requirements
  
  return { isValid: errors.length === 0, errors };
}
```

### WebX Pay Settings
```typescript
const WEBX_PAY_CONFIG = {
  checkoutUrl: process.env.WEBX_PAY_CHECKOUT_URL!,
  secretKey: process.env.WEBX_PAY_SECRET_KEY!,
  publicKey: process.env.WEBX_PAY_PUBLIC_KEY!,
  encMethod: process.env.WEBX_PAY_ENC_METHOD!,
  successUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  failureUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  supportedCurrencies: ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']
};
```

## 🏗️ API Architecture

### Payment Processing Flow
1. **Customer submits payment form** → `/payment`
2. **Server validates environment variables** → Environment validation
3. **Server validates and prepares data** → `/api/payment`
4. **Redirect to WebX Pay** → WebX Pay checkout
5. **Customer completes payment** → WebX Pay processing
6. **WebX Pay sends webhook** → `/api/payment/webhook`
7. **Customer redirected back** → `/payment-success` or `/payment-failure`

### Environment Variable Validation
Before processing any payment, the system validates all required environment variables:

```typescript
// Automatic validation on startup
const envValidation = validateEnvironmentVariables();
if (!envValidation.isValid) {
  logger.error('Environment validation failed', new Error('Missing required environment variables'), {
    errors: envValidation.errors,
    action: 'environment_validation'
  });
  
  return NextResponse.json({
    success: false,
    message: 'Server configuration error',
    errors: envValidation.errors
  }, { status: 500 });
}
```

### Payment Data Encryption
Following WebX Pay specification with RSA encryption:

```typescript
function encryptPaymentData(plaintext: string, publicKey: string): string {
  const buffer = Buffer.from(plaintext, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  
  return encrypted.toString('base64');
}

// Usage: orderId|amount format
const plaintext = `${orderId}|${amount}`;
const encryptedPayment = encryptPaymentData(plaintext, WEBX_PAY_CONFIG.publicKey);
```

### Webhook Processing
The webhook endpoint processes WebX Pay notifications with proper status handling:

```typescript
// WebX Pay uses status codes: '00' = success, other codes = failure
switch (webhookData.status_code) {
  case '00':
    await handleSuccessfulPayment(webhookData);
    response = { success: true, message: 'Payment processed successfully' };
    break;
    
  default:
    await handleFailedPayment(webhookData);
    response = { success: false, message: `Payment failed with status code: ${webhookData.status_code}` };
    break;
}
```

## API Endpoints

### POST /api/payment
Processes payment data and prepares it for WebX Pay integration with full environment validation.

**Environment Validation Response (if validation fails):**
```json
{
  "success": false,
  "message": "Server configuration error",
  "errors": [
    "Missing required environment variable: WEBX_PAY_SECRET_KEY",
    "WEBX_PAY_CHECKOUT_URL must be a valid URL",
    "WEBX_PAY_PUBLIC_KEY must be a valid RSA public key"
  ]
}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "customer@example.com",
  "contactNumber": "0773606370",
  "addressLineOne": "46/46, Green Lanka Building",
  "addressLineTwo": "Nawam Mawatha",
  "city": "Colombo",
  "state": "Western",
  "postalCode": "10300",
  "country": "Sri Lanka",
  "processCurrency": "LKR",
  "paymentGatewayId": "",
  "multiplePaymentGatewayIds": "",
  "amount": 1000
}
```

**Success Response:**
```json
{
  "success": true,
  "orderId": "1751644419465",
  "amount": 1000,
  "currency": "LKR",
  "checkoutUrl": "https://webxpay.com/index.php?route=checkout/billing",
  "formData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "customer@example.com",
    "contact_number": "0773606370",
    "address_line_one": "46/46, Green Lanka Building",
    "address_line_two": "Nawam Mawatha",
    "city": "Colombo",
    "state": "Western",
    "postal_code": "10300",
    "country": "Sri Lanka",
    "process_currency": "LKR",
    "payment_gateway_id": "",
    "multiple_payment_gateway_ids": "",
    "cms": "Next.js",
    "custom_fields": "bmFtZTpKb2huIERvZXxlbWFpbDpjdXN0b21lckBleGFtcGxlLmNvbXxwaG9uZTowNzczNjA2MzcwfGFkZHJlc3M6NDYvNDYsIEdyZWVuIExhbmthIEJ1aWxkaW5nLCBDb2xvbWJv",
    "enc_method": "JCs3J+6oSz4V0LgE0zi/Bg==",
    "secret_key": "630be963-59e2-447a-8f3b-93b3d7a3bf25",
    "payment": "encrypted_payment_data_here"
  },
  "message": "Payment data prepared successfully"
}
```

### POST /api/payment/webhook
Handles WebX Pay webhook notifications with proper status code processing.

**WebX Pay Webhook Data:**
```json
{
  "order_id": "1751644419465",
  "order_refference_number": "T476992025I04",
  "status_code": "00",
  "transaction_amount": "1000.00",
  "requested_amount": "1000.00",
  "payment": "base64_encoded_payment_data",
  "custom_fields": "base64_encoded_custom_fields",
  "signature": "webhook_signature"
}
```

**Success Response (status_code: "00"):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "order_id": "1751644419465",
  "status_code": "00",
  "reference_number": "T476992025I04",
  "timestamp": "2025-07-04T15:54:49.515Z"
}
```

**Failure Response (status_code: other than "00"):**
```json
{
  "success": false,
  "message": "Payment failed with status code: 01",
  "order_id": "1751644419465",
  "status_code": "01",
  "reference_number": "T476992025I04",
  "timestamp": "2025-07-04T15:54:49.515Z"
}
```

### GET /api/payment/webhook
Handles webhook verification and health checks.

**Webhook Verification (with challenge parameter):**
```json
{
  "challenge": "verification_challenge_string"
}
```

**Health Check Response:**
```json
{
  "message": "WebX Pay webhook endpoint",
  "timestamp": "2025-07-04T15:54:49.515Z",
  "status": "healthy",
  "version": "1.0.0"
}
```

## Configuration

### WebX Pay Settings
```typescript
const WEBX_PAY_CONFIG = {
  checkoutUrl: 'https://webxpay.com/index.php?route=checkout/billing',
  secretKey: '630be963-59e2-447a-8f3b-93b3d7a3bf25',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9l2HykxDIDVZeyDPJU4pA0imf
3nWsvyJgb3zTsnN8B0mFX6u5squ5NQcnQ03L8uQ56b4/isHBgiyKwfMr4cpEpCTY
/t1WSdJ5EokCI/F7hCM7aSSSY85S7IYOiC6pKR4WbaOYMvAMKn5gCobEPtosmPLz
gh8Lo3b8UsjPq2W26QIDAQAB
-----END PUBLIC KEY-----`,
  encMethod: 'JCs3J+6oSz4V0LgE0zi/Bg=='
};
```

## PHP to Node.js Conversion

### Original PHP Code
```php
// unique_order_id|total_amount 
$plaintext = '525|1000'; 
$publickey = "-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----"; 

//load public key for encrypting 
openssl_public_encrypt($plaintext, $encrypt, $publickey); 

//encode for data passing 
$payment = base64_encode($encrypt); 

//checkout URL 
$url = 'https://webxpay.com/index.php?route=checkout/billing'; 

//custom fields 
//cus_1|cus_2|cus_3|cus_4 
$custom_fields = base64_encode('cus_1|cus_2|cus_3|cus_4'); 
```

### Node.js Implementation
```typescript
function encryptPaymentData(plaintext: string, publicKey: string): string {
  const buffer = Buffer.from(plaintext, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  
  return encrypted.toString('base64');
}

// Usage
const plaintext = `${orderId}|${amount}`;
const encryptedPayment = encryptPaymentData(plaintext, publicKey);
```

## Pages

### 1. `/payment` - Payment Form
- Modern responsive payment form
- RSA encryption integration
- Demo/Production mode toggle
- Real-time form validation

### 2. `/webx-pay-redirect` - WebX Pay Redirect
- Automatic form submission to WebX Pay
- Loading spinner during redirect
- Error handling for missing data

### 3. `/payment-success` - Success Page
- Transaction confirmation
- Order details display
- Navigation options

## Security Considerations

1. **Environment Variables**: All sensitive keys are stored in environment variables with validation
2. **RSA Encryption**: Payment data is encrypted using WebX Pay's RSA public key
3. **Input Validation**: Comprehensive server-side validation of all form inputs
4. **Error Handling**: Secure error handling without exposing sensitive information
5. **HTTPS**: Always use HTTPS in production environments
6. **Data Sanitization**: Automatic PII masking in logs and error responses
7. **Webhook Security**: Proper webhook signature verification and data parsing
8. **Environment Validation**: Startup validation prevents deployment with missing configuration

## Error Handling

### Environment Configuration Errors
The application validates all required environment variables on startup:

```typescript
// Environment validation errors
{
  "success": false,
  "message": "Server configuration error",
  "errors": [
    "Missing required environment variable: WEBX_PAY_SECRET_KEY",
    "WEBX_PAY_CHECKOUT_URL must be a valid URL",
    "WEBX_PAY_PUBLIC_KEY must be a valid RSA public key",
    "WEBX_PAY_SECRET_KEY must be at least 10 characters long"
  ]
}
```

### Payment Processing Errors
```typescript
// Payment validation errors
{
  "success": false,
  "message": "Payment validation failed",
  "errors": [
    "First name must be at least 2 characters long",
    "Valid email address is required",
    "Minimum amount is 100 cents (1.00)"
  ]
}
```

### Webhook Processing Errors
```typescript
// Webhook processing errors
{
  "success": false,
  "message": "Webhook processing failed",
  "error": "Invalid webhook data: missing required fields",
  "timestamp": "2025-07-04T15:54:49.515Z"
}
```

## Testing

### Demo Mode
- Uncheck "Redirect to WebX Pay" to test the form without actual payment processing
- Form data is encrypted and prepared but redirects to success page

### WebX Pay Mode
- Check "Redirect to WebX Pay" to test actual WebX Pay integration
- Automatically redirects to WebX Pay checkout with encrypted payment data

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the payment page**:
   ```
   http://localhost:3001/payment
   ```

3. **Test the integration**:
   - Fill out the payment form
   - Choose demo or WebX Pay mode
   - Submit the form to test the flow

## Production Deployment

1. **Environment Variables**: Store sensitive keys in environment variables
2. **HTTPS**: Enable HTTPS for secure communication
3. **Error Logging**: Implement comprehensive error logging
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Sanitization**: Sanitize all user inputs
6. **Payment Gateway Testing**: Test with WebX Pay in sandbox mode before going live

## 📊 Production Logging Features

### Log Levels and Types
```typescript
export enum LogLevel {
  DEBUG = 'debug',      // Development debugging information
  INFO = 'info',        // General application information
  WARN = 'warn',        // Warning conditions
  ERROR = 'error',      // Error conditions
  SECURITY = 'security', // Security-related events
  AUDIT = 'audit'       // Audit trail for compliance
}
```

### Payment-Specific Logging
- **Payment Initiation**: Logs when payment process starts
- **Data Preparation**: RSA encryption and data preparation logs
- **Payment Redirect**: WebX Pay redirect logging
- **Webhook Reception**: Incoming webhook processing logs
- **Payment Success/Failure**: Final payment status logging
- **Performance Metrics**: Request timing and performance data

### Log Structure
All logs follow a structured JSON format:
```json
{
  "level": "audit",
  "message": "Payment completed successfully",
  "context": {
    "orderId": "1751609138548",
    "referenceNumber": "T476992025I04",
    "amount": "100.00",
    "currency": "LKR",
    "action": "payment_success"
  },
  "timestamp": "2025-07-04T06:06:21.000Z",
  "service": "webx-pay-integration",
  "version": "1.0.0",
  "environment": "production"
}
```

### Data Sanitization
- **Payment Data**: Encrypted payment strings are truncated
- **Personal Information**: Email and phone numbers are masked
- **Signatures**: Only last 8 characters shown
- **Secret Keys**: Completely redacted

### Usage Examples
```typescript
import { logger } from '@/lib/logger';

// Payment processing
logger.paymentInitiated(orderId, amount, currency, request);
logger.paymentDataPrepared(orderId, amount, currency, encryptedLength);
logger.paymentSuccess(orderId, referenceNumber, amount);

// Error handling
logger.error('Payment processing failed', error, { orderId });
logger.securityAlert('Suspicious payment attempt', { ipAddress });

// Performance monitoring
const timer = new PerformanceTimer('payment_encryption');
// ... perform operation
timer.end();
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
**GET** `/api/monitoring` - System health status
```json
{
  "status": "healthy",
  "checks": {
    "webxPayEndpoint": "healthy",
    "databaseConnection": "healthy", 
    "webhookEndpoint": "available",
    "encryptionService": "healthy"
  },
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Monitoring Dashboard
**GET** `/api/monitoring?timeframe=24h&level=info`
- Payment volume and success rates
- Performance metrics
- Error rates and trends
- System health indicators

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Configuration Issues
**Problem**: "Server configuration error" with missing environment variables
**Solution**: 
- Check your `.env.local` file exists and contains all required variables
- Verify environment variable names match exactly (case-sensitive)
- Ensure RSA public key includes proper BEGIN/END headers
- Validate URLs are properly formatted (include protocol)

#### 2. Webhook Processing Issues
**Problem**: Webhook returns "Invalid webhook data" error
**Solution**:
- Verify WebX Pay is sending data in the expected format
- Check webhook endpoint is publicly accessible
- Ensure proper content-type handling (supports both JSON and form-encoded)
- Validate WebX Pay webhook URL configuration

#### 3. Payment Redirection Issues
**Problem**: "URL is malformed" error during redirect
**Solution**:
- Webhooks should return JSON responses, not redirects
- Use absolute URLs for any redirects (include full domain)
- Check NEXT_PUBLIC_BASE_URL is properly configured

#### 4. RSA Encryption Issues
**Problem**: Payment data encryption fails
**Solution**:
- Verify RSA public key format (must include BEGIN/END PUBLIC KEY headers)
- Check key is properly formatted (no extra spaces or characters)
- Ensure key matches WebX Pay provided public key exactly

### Debug Mode
Enable debug logging by setting log level to DEBUG:

```typescript
// In your webhook processing
logger.debug('Raw webhook body received', {
  bodyLength: rawBody.length,
  contentType: request.headers.get('content-type') || 'unknown'
});
```

### Testing Webhook Locally
Use tools like ngrok to expose your local webhook endpoint:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port 3001
ngrok http 3001

# Use the provided URL as your webhook endpoint in WebX Pay
# Example: https://abc123.ngrok.io/api/payment/webhook
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured in production
- [ ] Environment validation passes locally
- [ ] RSA public key properly formatted
- [ ] Webhook endpoint publicly accessible
- [ ] HTTPS enabled for production domain
- [ ] Error logging configured
- [ ] Payment flow tested in sandbox mode

### Production Deployment
- [ ] Environment variables set in production environment
- [ ] NEXT_PUBLIC_BASE_URL points to production domain
- [ ] Webhook URL configured in WebX Pay dashboard
- [ ] SSL certificate installed and working
- [ ] Error monitoring and alerting configured
- [ ] Payment testing completed successfully
- [ ] Backup and recovery procedures in place

### Post-Deployment
- [ ] Monitor application logs for errors
- [ ] Test payment flow end-to-end
- [ ] Verify webhook processing works correctly
- [ ] Check payment success/failure pages
- [ ] Monitor performance metrics
- [ ] Set up log aggregation and monitoring
