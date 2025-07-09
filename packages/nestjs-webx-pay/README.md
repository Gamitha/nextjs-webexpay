# @webx-pay/nestjs-backend

A NestJS module for integrating WebX Pay payment gateway into your NestJS applications.

## Installation

```bash
npm install @webx-pay/nestjs-backend
```

## Features

- 🔐 Secure payment processing with RSA encryption
- 📝 Built-in validation with class-validator
- 🌐 Webhook handling and verification
- 🔧 Configurable module with async support
- 🎯 TypeScript support with full type definitions
- 📊 Health check endpoints
- 💳 Multi-currency support

## Quick Start

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { WebXPayModule } from '@webx-pay/nestjs-backend';

@Module({
  imports: [
    WebXPayModule.forRoot({
      checkoutUrl: 'https://payment.webxpay.com/pgw/frontend/checkout.php',
      secretKey: 'your-secret-key',
      publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`,
      encMethod: 'RSA',
      baseUrl: 'https://your-app.com',
      environment: 'sandbox', // or 'production'
      supportedCurrencies: ['LKR', 'USD', 'EUR']
    })
  ]
})
export class AppModule {}
```

### 2. Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebXPayModule } from '@webx-pay/nestjs-backend';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WebXPayModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        checkoutUrl: configService.get('WEBX_PAY_CHECKOUT_URL'),
        secretKey: configService.get('WEBX_PAY_SECRET_KEY'),
        publicKey: configService.get('WEBX_PAY_PUBLIC_KEY'),
        encMethod: 'RSA',
        baseUrl: configService.get('APP_BASE_URL'),
        environment: configService.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
        supportedCurrencies: ['LKR', 'USD', 'EUR']
      })
    })
  ]
})
export class AppModule {}
```

## Usage

### Using the Service

```typescript
import { Injectable } from '@nestjs/common';
import { WebXPayService, PaymentFormData } from '@webx-pay/nestjs-backend';

@Injectable()
export class PaymentService {
  constructor(private readonly webxPayService: WebXPayService) {}

  async processPayment(paymentData: PaymentFormData) {
    const result = await this.webxPayService.processPayment(paymentData);
    
    if (result.success) {
      // Payment data is ready for submission to WebX Pay
      return {
        checkoutUrl: result.checkoutUrl,
        formData: result.formData,
        orderId: result.orderId
      };
    } else {
      throw new Error(result.error);
    }
  }
}
```

### Using the Controller

The module automatically provides these endpoints:

- `POST /webx-pay/payment` - Process payment requests
- `POST /webx-pay/webhook` - Handle webhook notifications
- `POST /webx-pay/webhook/verify` - Verify webhook data
- `GET /webx-pay/health` - Health check
- `GET /webx-pay/currencies` - Get supported currencies

### Custom Controller

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { WebXPayService, PaymentRequestDto } from '@webx-pay/nestjs-backend';

@Controller('payments')
export class PaymentController {
  constructor(private readonly webxPayService: WebXPayService) {}

  @Post('process')
  async processPayment(@Body() paymentDto: PaymentRequestDto) {
    return await this.webxPayService.processPayment(paymentDto);
  }
}
```

## API Reference

### PaymentRequestDto

```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  processCurrency: string;
  amount: number;
  description?: string;
  orderId?: string;
  paymentGatewayId?: string;
  multiplePaymentGatewayIds?: string;
}
```

### PaymentResponse

```typescript
{
  success: boolean;
  orderId: string;
  formData?: WebXPayFormData;
  checkoutUrl?: string;
  error?: string;
}
```

### WebhookResponse

```typescript
{
  success: boolean;
  orderId?: string;
  status?: string;
  error?: string;
  data?: WebXPayWebhookData;
}
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `checkoutUrl` | string | Yes | WebX Pay checkout URL |
| `secretKey` | string | Yes | Your WebX Pay secret key |
| `publicKey` | string | Yes | WebX Pay RSA public key |
| `encMethod` | string | Yes | Encryption method (usually 'RSA') |
| `baseUrl` | string | Yes | Your application base URL |
| `environment` | string | No | 'sandbox' or 'production' |
| `supportedCurrencies` | string[] | No | Array of supported currencies |

## Environment Variables

```bash
WEBX_PAY_CHECKOUT_URL=https://payment.webxpay.com/pgw/frontend/checkout.php
WEBX_PAY_SECRET_KEY=your-secret-key
WEBX_PAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
APP_BASE_URL=https://your-app.com
NODE_ENV=development
```

## Webhook Handling

The module automatically handles webhook notifications from WebX Pay:

```typescript
// Webhook payload is automatically parsed and validated
{
  orderId: string;
  referenceNumber: string;
  timestamp: string;
  statusCode: string;
  statusMessage: string;
  gatewayId: string;
  transactionAmount: string;
  requestedAmount?: string;
  customFields?: Record<string, string>;
}
```

## Error Handling

The module includes comprehensive error handling:

- Configuration validation
- Payment data validation
- Encryption/decryption errors
- Webhook processing errors

## Security Features

- RSA encryption for sensitive payment data
- Input validation with class-validator
- Secure webhook processing
- Base64 encoding for custom fields

## Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact [your-email@example.com] or create an issue in the GitHub repository.

## Changelog

### v1.0.0
- Initial release
- Basic payment processing
- Webhook handling
- TypeScript support
- Configurable module
