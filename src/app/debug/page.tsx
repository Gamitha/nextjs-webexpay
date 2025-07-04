'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testPaymentAPI = async () => {
    setLoading(true);
    try {
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        contactNumber: '0773606370',
        addressLineOne: '123 Test Street',
        addressLineTwo: 'Test Area',
        city: 'Colombo',
        state: 'Western',
        postalCode: '10300',
        country: 'Sri Lanka',
        processCurrency: 'LKR',
        paymentGatewayId: '',
        multiplePaymentGatewayIds: '',
        amount: 1000,
        description: 'Test payment'
      };

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>WebX Pay Debug</h1>
      
      <button 
        onClick={testPaymentAPI}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Payment API'}
      </button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>API Response:</h2>
          <pre style={{ 
            background: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Staging URL Check:</h2>
        <p>Current staging URL: <code>https://stagingxpay.info/index.php?route=checkout/billing</code></p>
        <p>Secret Key: <code>b7b682c3-3640-424d-b1ea-e600cda8e1a6</code></p>
        <p>Enc Method: <code>JCs3J+6oSz4V0LgE0zi/Bg==</code></p>
      </div>
    </div>
  );
}
