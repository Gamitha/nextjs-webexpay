'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import WebXPayForm from '../components/WebXPayForm';

interface PaymentData {
  checkoutUrl: string;
  webxPayData?: {
    merchant_id: string;
    order_id: string;
    amount: string;
    currency: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    items: string;
    custom_1?: string;
    custom_2?: string;
    custom_3?: string;
    custom_4?: string;
    hash: string;
  };
  // Legacy form data for backward compatibility
  formData?: {
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
  };
}

export default function WebXPayRedirect() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const currency = searchParams.get('currency');
        
        if (!orderId || !amount || !currency) {
          setError('Missing payment parameters');
          setLoading(false);
          return;
        }

        // Get the payment data from session storage or make API call
        const storedPaymentData = sessionStorage.getItem('webxPaymentData');
        if (storedPaymentData) {
          const data = JSON.parse(storedPaymentData);
          setPaymentData(data);
        } else {
          setError('Payment data not found. Please try again.');
        }
      } catch (err) {
        setError('Failed to load payment data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading payment data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <button 
            onClick={() => window.location.href = '/payment'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Payment
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>No payment data available</div>
      </div>
    );
  }

  return (
    <WebXPayForm
      checkoutUrl={paymentData.checkoutUrl}
      webxPayData={paymentData.webxPayData}
      formData={paymentData.formData}
    />
  );
}
