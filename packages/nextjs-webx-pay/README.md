# @webx-pay/nextjs-frontend

A React/Next.js frontend package for integrating WebX Pay payment gateway with beautiful UI components and hooks.

## Installation

```bash
npm install @webx-pay/nextjs-frontend
```

## Features

- 🎨 Beautiful, responsive payment forms
- 🔗 React hooks for easy integration
- 📱 Mobile-friendly components
- 🎯 TypeScript support with full type definitions
- 🔧 Highly customizable components
- 📦 Context provider for global state management
- 🚀 Auto-submit functionality for seamless redirects
- 💾 Form validation and error handling

## Quick Start

### 1. Wrap your app with WebXPayProvider

```tsx
import { WebXPayProvider } from '@webx-pay/nextjs-frontend';

function App() {
  return (
    <WebXPayProvider 
      config={{
        apiUrl: 'http://localhost:3000/api', // Your backend API URL
        environment: 'sandbox',
        defaultCurrency: 'LKR',
        timeout: 30000
      }}
    >
      <YourApp />
    </WebXPayProvider>
  );
}
```

### 2. Use the WebXPayForm component

```tsx
import { WebXPayForm } from '@webx-pay/nextjs-frontend';

function PaymentPage() {
  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    // Handle successful payment
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    // Handle payment error
  };

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <WebXPayForm
        onSuccess={handleSuccess}
        onError={handleError}
        initialData={{
          amount: 1000,
          processCurrency: 'LKR',
          description: 'Product purchase'
        }}
      />
    </div>
  );
}
```

### 3. Use the useWebXPay hook

```tsx
import { useWebXPay } from '@webx-pay/nextjs-frontend';

function CustomPaymentComponent() {
  const { processPayment, state } = useWebXPay({
    onSuccess: (response) => {
      console.log('Payment processed:', response);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    }
  });

  const handlePayment = async () => {
    await processPayment({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      contactNumber: '0771234567',
      addressLineOne: '123 Main St',
      city: 'Colombo',
      state: 'Western',
      postalCode: '10001',
      country: 'Sri Lanka',
      processCurrency: 'LKR',
      amount: 1000
    });
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={state.loading}>
        {state.loading ? 'Processing...' : 'Pay Now'}
      </button>
      
      {state.error && <p>Error: {state.error}</p>}
    </div>
  );
}
```

## Components

### WebXPayForm

A complete payment form with built-in validation and styling.

```tsx
<WebXPayForm
  onSuccess={(response) => console.log('Success:', response)}
  onError={(error) => console.error('Error:', error)}
  initialData={{
    amount: 1000,
    processCurrency: 'LKR'
  }}
  showTitle={true}
  title="Payment Information"
  submitButtonText="Pay Now"
  disabled={false}
  loading={false}
  className="my-payment-form"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: PaymentFormData) => void` | Called when form is submitted |
| `onSuccess` | `(response: PaymentResponse) => void` | Called on successful payment |
| `onError` | `(error: string) => void` | Called on payment error |
| `initialData` | `Partial<PaymentFormData>` | Initial form data |
| `showTitle` | `boolean` | Show form title |
| `title` | `string` | Form title text |
| `submitButtonText` | `string` | Submit button text |
| `disabled` | `boolean` | Disable form |
| `loading` | `boolean` | Show loading state |
| `className` | `string` | Additional CSS classes |

### WebXPayButton

A customizable payment button component.

```tsx
<WebXPayButton
  onClick={() => console.log('Button clicked')}
  variant="primary"
  size="medium"
  loading={false}
  disabled={false}
>
  Pay Now
</WebXPayButton>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `() => void` | Click handler |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'danger'` | Button style |
| `size` | `'small' \| 'medium' \| 'large'` | Button size |
| `loading` | `boolean` | Show loading spinner |
| `disabled` | `boolean` | Disable button |
| `children` | `ReactNode` | Button content |
| `className` | `string` | Additional CSS classes |

### WebXPayAutoSubmit

Auto-submit form for seamless payment gateway redirection.

```tsx
<WebXPayAutoSubmit
  formData={webxPayFormData}
  checkoutUrl="https://payment.webxpay.com/checkout"
  onSubmit={() => console.log('Redirecting...')}
  className="auto-submit-form"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `formData` | `WebXPayFormData` | Payment form data |
| `checkoutUrl` | `string` | Payment gateway URL |
| `onSubmit` | `() => void` | Called before redirect |
| `className` | `string` | Additional CSS classes |

## Hooks

### useWebXPay

Main hook for payment processing.

```tsx
const { processPayment, state, reset } = useWebXPay({
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
  onPending: () => {
    // Handle pending state
  }
});
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `processPayment` | `(data: PaymentFormData) => Promise<void>` | Process payment |
| `state` | `PaymentState` | Current payment state |
| `reset` | `() => void` | Reset payment state |

#### PaymentState

```tsx
{
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  loading: boolean;
  error: string | null;
  orderId: string | null;
  data: PaymentFormData | null;
}
```

### useWebXPayContext

Access the WebXPay context.

```tsx
const { config, processPayment, getSupportedCurrencies, isLoading, error } = useWebXPayContext();
```

## API Client

Direct API client for advanced use cases.

```tsx
import { WebXPayApiClient } from '@webx-pay/nextjs-frontend';

const client = new WebXPayApiClient({
  apiUrl: 'http://localhost:3000/api',
  timeout: 30000
});

// Process payment
const response = await client.processPayment(paymentData);

// Get supported currencies
const currencies = await client.getSupportedCurrencies();

// Health check
const health = await client.healthCheck();
```

## Styling

### Default CSS Classes

The package includes these CSS classes for styling:

```css
/* Form styles */
.webx-pay-form { }
.webx-pay-form .form-row { }
.webx-pay-form .form-field { }
.webx-pay-form .form-field label { }
.webx-pay-form .form-field input { }
.webx-pay-form .form-field select { }
.webx-pay-form .form-field .error { }
.webx-pay-form .form-actions { }
.webx-pay-submit-button { }
.webx-pay-error { }

/* Button styles */
.webx-pay-button { }
.webx-pay-button--primary { }
.webx-pay-button--secondary { }
.webx-pay-button--success { }
.webx-pay-button--danger { }
.webx-pay-button--small { }
.webx-pay-button--medium { }
.webx-pay-button--large { }
.webx-pay-button--loading { }
.webx-pay-button--disabled { }
.webx-pay-button__spinner { }
.webx-pay-button__content { }

/* Auto-submit styles */
.webx-pay-auto-submit { }
.webx-pay-loading { }
.webx-pay-spinner { }
```

### Custom Styling

You can override the default styles by providing your own CSS:

```css
.webx-pay-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.webx-pay-button--primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
}
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```tsx
import type { 
  PaymentFormData, 
  PaymentResponse, 
  WebXPayConfig,
  PaymentState
} from '@webx-pay/nextjs-frontend';

const config: WebXPayConfig = {
  apiUrl: 'http://localhost:3000/api',
  environment: 'sandbox',
  defaultCurrency: 'LKR',
  timeout: 30000
};

const handlePayment = async (data: PaymentFormData): Promise<PaymentResponse> => {
  // Your payment logic
};
```

## Examples

### Complete Payment Flow

```tsx
import { WebXPayProvider, WebXPayForm, WebXPayAutoSubmit } from '@webx-pay/nextjs-frontend';
import { useState } from 'react';

function PaymentFlow() {
  const [paymentData, setPaymentData] = useState(null);
  const [showRedirect, setShowRedirect] = useState(false);

  const handleSuccess = (response) => {
    if (response.success && response.formData) {
      setPaymentData(response);
      setShowRedirect(true);
    }
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error);
  };

  if (showRedirect && paymentData) {
    return (
      <WebXPayAutoSubmit
        formData={paymentData.formData}
        checkoutUrl={paymentData.checkoutUrl}
        onSubmit={() => console.log('Redirecting to payment gateway...')}
      />
    );
  }

  return (
    <WebXPayProvider config={{
      apiUrl: 'http://localhost:3000/api',
      environment: 'sandbox'
    }}>
      <div className="payment-container">
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
    </WebXPayProvider>
  );
}
```

### Custom Payment Form

```tsx
import { useWebXPay, WebXPayButton } from '@webx-pay/nextjs-frontend';
import { useState } from 'react';

function CustomPaymentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    amount: 1000,
    // ... other fields
  });

  const { processPayment, state } = useWebXPay({
    onSuccess: (response) => {
      console.log('Payment successful:', response);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await processPayment(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
      />
      {/* ... other form fields */}
      
      <WebXPayButton
        type="submit"
        variant="primary"
        size="large"
        loading={state.loading}
        disabled={state.loading}
      >
        {state.loading ? 'Processing...' : 'Pay Now'}
      </WebXPayButton>

      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
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
- WebXPayForm component
- WebXPayButton component
- WebXPayAutoSubmit component
- useWebXPay hook
- Context provider
- API client
- TypeScript support
- Comprehensive documentation
