# WebX Pay Integration Packages

A complete WebX Pay integration solution with separate packages for NestJS backend and Next.js frontend. This monorepo contains modular, reusable packages that can be published to npm and used in different projects.

## 📦 Packages

### [@webx-pay/nestjs-backend](./nestjs-webx-pay)
- **Description**: NestJS module for WebX Pay payment processing
- **Features**: Payment processing, webhook handling, RSA encryption, validation
- **Tech Stack**: NestJS, TypeScript, class-validator, class-transformer

### [@webx-pay/nextjs-frontend](./nextjs-webx-pay)
- **Description**: React/Next.js components and hooks for WebX Pay integration
- **Features**: Payment forms, auto-submit, hooks, context provider
- **Tech Stack**: React, Next.js, TypeScript, Axios

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Or install for specific packages
npm run install:backend
npm run install:frontend
```

### 2. Build Packages

```bash
# Build all packages
npm run build

# Or build specific packages
npm run build:backend
npm run build:frontend
```

### 3. Use in Your Projects

#### Backend (NestJS)

```bash
npm install @webx-pay/nestjs-backend
```

```typescript
import { Module } from '@nestjs/common';
import { WebXPayModule } from '@webx-pay/nestjs-backend';

@Module({
  imports: [
    WebXPayModule.forRoot({
      checkoutUrl: 'https://payment.webxpay.com/pgw/frontend/checkout.php',
      secretKey: 'your-secret-key',
      publicKey: 'your-public-key',
      encMethod: 'RSA',
      baseUrl: 'https://your-app.com',
      environment: 'sandbox'
    })
  ]
})
export class AppModule {}
```

#### Frontend (Next.js)

```bash
npm install @webx-pay/nextjs-frontend
```

```tsx
import { WebXPayProvider, WebXPayForm } from '@webx-pay/nextjs-frontend';

function App() {
  return (
    <WebXPayProvider 
      config={{
        apiUrl: 'http://localhost:3000/api',
        environment: 'sandbox'
      }}
    >
      <WebXPayForm
        onSuccess={(response) => console.log('Success:', response)}
        onError={(error) => console.error('Error:', error)}
        initialData={{
          amount: 1000,
          processCurrency: 'LKR'
        }}
      />
    </WebXPayProvider>
  );
}
```

## 🏗️ Architecture

### Backend Package Structure
```
packages/nestjs-webx-pay/
├── src/
│   ├── interfaces/          # TypeScript interfaces
│   ├── dto/                 # Data Transfer Objects
│   ├── services/            # Business logic
│   ├── controllers/         # API endpoints
│   ├── decorators/          # Custom decorators
│   └── index.ts            # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

### Frontend Package Structure
```
packages/nextjs-webx-pay/
├── src/
│   ├── types/              # TypeScript types
│   ├── api/                # API client
│   ├── context/            # React context
│   ├── hooks/              # Custom hooks
│   ├── components/         # React components
│   └── index.ts           # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run build              # Build all packages
npm run build:backend      # Build backend package
npm run build:frontend     # Build frontend package

# Package Management
npm run clean              # Clean dist folders and node_modules
npm run pack:backend       # Pack backend for testing
npm run pack:frontend      # Pack frontend for testing

# Publishing
npm run publish:backend    # Publish backend to npm
npm run publish:frontend   # Publish frontend to npm
```

### Testing Packages Locally

#### 1. Pack the packages
```bash
npm run pack:backend
npm run pack:frontend
```

#### 2. Install in your test project
```bash
# In your test project
npm install /path/to/webx-pay-monorepo/packages/nestjs-webx-pay/webx-pay-nestjs-backend-1.0.0.tgz
npm install /path/to/webx-pay-monorepo/packages/nextjs-webx-pay/webx-pay-nextjs-frontend-1.0.0.tgz
```

## 🔐 Configuration

### Backend Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `checkoutUrl` | string | Yes | WebX Pay checkout URL |
| `secretKey` | string | Yes | Your WebX Pay secret key |
| `publicKey` | string | Yes | WebX Pay RSA public key |
| `encMethod` | string | Yes | Encryption method (usually 'RSA') |
| `baseUrl` | string | Yes | Your application base URL |
| `environment` | string | No | 'sandbox' or 'production' |
| `supportedCurrencies` | string[] | No | Array of supported currencies |

### Frontend Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | string | Yes | Backend API URL |
| `environment` | string | No | 'sandbox' or 'production' |
| `defaultCurrency` | string | No | Default currency |
| `timeout` | number | No | Request timeout in milliseconds |

## 📡 API Endpoints

### Backend Endpoints

- `POST /webx-pay/payment` - Process payment requests
- `POST /webx-pay/webhook` - Handle webhook notifications
- `POST /webx-pay/webhook/verify` - Verify webhook data
- `GET /webx-pay/health` - Health check
- `GET /webx-pay/currencies` - Get supported currencies

### Request/Response Examples

#### Payment Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contactNumber": "0771234567",
  "addressLineOne": "123 Main St",
  "city": "Colombo",
  "state": "Western",
  "postalCode": "10001",
  "country": "Sri Lanka",
  "processCurrency": "LKR",
  "amount": 1000,
  "description": "Product purchase"
}
```

#### Payment Response
```json
{
  "success": true,
  "orderId": "1640995200000_abc123",
  "formData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "0771234567",
    "address_line_one": "123 Main St",
    "city": "Colombo",
    "state": "Western",
    "postal_code": "10001",
    "country": "Sri Lanka",
    "process_currency": "LKR",
    "cms": "NestJS WebX Pay Module",
    "custom_fields": "bmFtZTpKb2huIERvZXxlbWFpbDpqb2huLmRvZUBleGFtcGxlLmNvbXxwaG9uZTowNzcxMjM0NTY3fGFkZHJlc3M6MTIzIE1haW4gU3QsIENvbG9tYm8=",
    "enc_method": "RSA",
    "secret_key": "your-secret-key",
    "payment": "encrypted-payment-data",
    "return_url": "https://your-app.com/payment-success",
    "cancel_url": "https://your-app.com/payment-failure",
    "notify_url": "https://your-app.com/api/payment/webhook"
  },
  "checkoutUrl": "https://payment.webxpay.com/pgw/frontend/checkout.php"
}
```

## 🔒 Security Features

- **RSA Encryption**: Sensitive payment data is encrypted using RSA public key
- **Input Validation**: Comprehensive validation using class-validator
- **Type Safety**: Full TypeScript support with strict typing
- **Webhook Security**: Secure webhook processing and verification
- **Error Handling**: Robust error handling and logging

## 🌍 Environment Variables

### Backend (.env)
```bash
WEBX_PAY_CHECKOUT_URL=https://payment.webxpay.com/pgw/frontend/checkout.php
WEBX_PAY_SECRET_KEY=your-secret-key
WEBX_PAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
APP_BASE_URL=https://your-app.com
NODE_ENV=development
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEBX_PAY_ENVIRONMENT=sandbox
```

## 📚 Examples

### Complete Integration Example

#### Backend (app.module.ts)
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
        environment: configService.get('NODE_ENV') === 'production' ? 'production' : 'sandbox'
      })
    })
  ]
})
export class AppModule {}
```

#### Frontend (pages/_app.tsx)
```tsx
import { AppProps } from 'next/app';
import { WebXPayProvider } from '@webx-pay/nextjs-frontend';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WebXPayProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
        environment: process.env.NEXT_PUBLIC_WEBX_PAY_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox'
      }}
    >
      <Component {...pageProps} />
    </WebXPayProvider>
  );
}

export default MyApp;
```

#### Frontend (pages/payment.tsx)
```tsx
import { WebXPayForm } from '@webx-pay/nextjs-frontend';
import { useRouter } from 'next/router';

export default function PaymentPage() {
  const router = useRouter();

  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    // Redirect to success page or show success message
    router.push('/payment-success');
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    // Show error message to user
  };

  return (
    <div className="container">
      <h1>Complete Your Payment</h1>
      <WebXPayForm
        onSuccess={handleSuccess}
        onError={handleError}
        initialData={{
          amount: 1500,
          processCurrency: 'LKR',
          description: 'Product Purchase'
        }}
      />
    </div>
  );
}
```

## 🚀 Publishing to npm

### Prerequisites
1. Create npm account at [npmjs.com](https://npmjs.com)
2. Login to npm CLI: `npm login`
3. Update package versions in `package.json` files

### Publishing Steps

1. **Build packages**
   ```bash
   npm run build
   ```

2. **Test packages locally**
   ```bash
   npm run pack:backend
   npm run pack:frontend
   ```

3. **Publish to npm**
   ```bash
   npm run publish:backend
   npm run publish:frontend
   ```

### Version Management

Update versions in `package.json` files before publishing:

```json
{
  "name": "@webx-pay/nestjs-backend",
  "version": "1.0.1",
  ...
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]
- Documentation: Check package READMEs for detailed usage

## 🔄 Changelog

### v1.0.0
- Initial release
- NestJS backend package with payment processing
- Next.js frontend package with UI components
- Full TypeScript support
- Comprehensive documentation
- Monorepo structure with npm workspaces
