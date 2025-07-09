# WebX Pay Integration Troubleshooting Guide

## Common Issues and Solutions

### 1. RSA Encryption Errors

**Problem**: "Failed to encrypt payment data" or "DECODER routines::unsupported"

**Solution**:
1. Ensure you have a valid RSA public key from WebX Pay
2. The public key must be in PEM format:
   ```
   -----BEGIN PUBLIC KEY-----
   [Your actual public key content here]
   -----END PUBLIC KEY-----
   ```
3. Replace the placeholder key in your `.env` file with the real one

### 2. Form Submission Issues

**Problem**: Form doesn't redirect to WebX Pay properly

**Solution**:
- Ensure all required fields are present in the form data
- Check that the checkout URL is correct
- Verify the form is properly submitted with POST method

### 3. Configuration Issues

**Problem**: Missing or invalid configuration

**Solution**:
Create a proper `.env` file with:
```env
WEBX_PAY_CHECKOUT_URL=https://payment.webxpay.com/pgw/frontend/checkout.php
WEBX_PAY_SECRET_KEY=your-actual-secret-key
WEBX_PAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
[Your actual public key]
-----END PUBLIC KEY-----
APP_BASE_URL=http://localhost:3001
NODE_ENV=development
```

### 4. Payment Data Format

**Problem**: Invalid payment data format

**Solution**:
Ensure the payment data includes all required fields:
- first_name, last_name
- email, contact_number
- address_line_one, city, state, postal_code, country
- process_currency, amount
- cms, custom_fields, enc_method, secret_key
- return_url, cancel_url, notify_url

### 5. Webhook Configuration

**Problem**: Webhooks not working

**Solution**:
- Ensure notify_url is accessible from the internet
- Use ngrok or similar for local testing
- Verify webhook signature validation

## Testing Steps

1. **Test Backend API**:
   ```bash
   curl -X GET http://localhost:3000/webx-pay/health
   ```

2. **Test Payment Processing**:
   ```bash
   curl -X POST http://localhost:3000/webx-pay/payment \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "contactNumber": "+94771234567",
       "addressLineOne": "123 Main St",
       "city": "Colombo",
       "state": "Western",
       "postalCode": "10001",
       "country": "Sri Lanka",
       "processCurrency": "LKR",
       "amount": 1500,
       "description": "Test Payment"
     }'
   ```

3. **Test Frontend**:
   - Open http://localhost:3001
   - Fill the form and submit
   - Check browser console for errors
   - Verify redirection to WebX Pay

## Environment Setup

1. **Backend**:
   ```bash
   cd demo/backend
   cp .env.example .env
   # Edit .env with your credentials
   npm run start:dev
   ```

2. **Frontend**:
   ```bash
   cd demo/frontend
   npm run dev
   ```

## Common Error Messages

- **"Public key is required"**: Add valid public key to .env
- **"Failed to encrypt payment data"**: Check public key format
- **"Form submission error"**: Check network connectivity
- **"Configuration error"**: Verify all required config values

## Production Checklist

- [ ] Valid WebX Pay credentials in .env
- [ ] HTTPS enabled for production
- [ ] Proper webhook URL (accessible from internet)
- [ ] Error handling and logging
- [ ] Input validation and sanitization
- [ ] Security headers configured
