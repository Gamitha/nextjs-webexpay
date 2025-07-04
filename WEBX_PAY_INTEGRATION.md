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

## 📋 WebX Pay Form Fields

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
WEBX_MERCHANT_ID=your_merchant_id_here
WEBX_SECRET_KEY=your_secret_key_here
WEBX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...your_public_key_here...
-----END PUBLIC KEY-----"
NEXT_PUBLIC_BASE_URL=http://localhost:3001
WEBX_CHECKOUT_URL=https://webxpay.com/index.php?route=checkout/billing
```

### WebX Pay Settings
```typescript
const WEBX_PAY_CONFIG = {
  merchantId: process.env.WEBX_MERCHANT_ID,
  secretKey: process.env.WEBX_SECRET_KEY,
  publicKey: process.env.WEBX_PUBLIC_KEY,
  checkoutUrl: process.env.WEBX_CHECKOUT_URL,
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
  failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure`,
  notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`
};
```

## 🏗️ API Architecture

### Payment Processing Flow
1. **Customer submits payment form** → `/payment`
2. **Server validates and prepares data** → `/api/payment`
3. **Redirect to WebX Pay** → `/webx-pay-redirect`
4. **Customer completes payment** → WebX Pay checkout
5. **WebX Pay sends webhook** → `/api/payment/webhook`
6. **Customer redirected back** → `/payment-success` or `/payment-failure`

### Hash Generation
Following WebX Pay specification:
```typescript
function createWebXPayHash(data: WebXPayFormData, secretKey: string): string {
  const hashString = `${data.merchant_id}${data.order_id}${data.amount}${data.currency}${secretKey}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
}
```

### Webhook Verification
```typescript
function verifyWebhookHash(data: WebXPayWebhookData, secretKey: string): boolean {
  const hashString = `${data.merchant_id}${data.order_id}${data.amount}${data.currency}${data.status}${secretKey}`;
  const expectedHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
  return expectedHash === data.hash;
}
```

## API Endpoints

### POST /api/payment
Processes payment data and prepares it for WebX Pay integration.

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

**Response:**
```json
{
  "success": true,
  "orderId": "ORDER_1704456789123_abc123def",
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
  "encryptedPayment": "encrypted_payment_data_here",
  "message": "Payment data prepared successfully"
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

1. **Public Key Security**: The RSA public key is embedded in the frontend code
2. **Secret Key**: The secret key should be stored securely (consider environment variables)
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Server-side validation of all form inputs
5. **Error Handling**: Comprehensive error handling without exposing sensitive information

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
