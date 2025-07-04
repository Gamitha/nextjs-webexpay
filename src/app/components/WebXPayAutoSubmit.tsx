'use client';

import { useEffect, useRef } from 'react';

interface WebXPayRedirectProps {
  webxPayData: {
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
  checkoutUrl: string;
  onError?: (error: string) => void;
}

export function WebXPayAutoSubmit({ webxPayData, checkoutUrl, onError }: WebXPayRedirectProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        console.log('Auto-submitting to WebX Pay:', checkoutUrl);
        console.log('Form data:', webxPayData);
        formRef.current.submit();
      } else {
        onError?.('Failed to create payment form');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [webxPayData, checkoutUrl, onError]);

  const handleManualSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#667eea',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#374151', 
          marginBottom: '0.5rem' 
        }}>
          Redirecting to WebX Pay
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          Please wait while we securely redirect you to WebX Pay for payment processing.
        </p>
        
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <p><strong>Order ID:</strong> {webxPayData.order_id}</p>
          <p><strong>Amount:</strong> {webxPayData.amount} {webxPayData.currency}</p>
          <p><strong>Customer:</strong> {webxPayData.first_name} {webxPayData.last_name}</p>
        </div>
        
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#9ca3af', 
          marginBottom: '1rem' 
        }}>
          If you are not redirected automatically, click the button below:
        </p>
        
        <button 
          onClick={handleManualSubmit}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#5a67d8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#667eea';
          }}
        >
          Continue to WebX Pay
        </button>
      </div>
      
      {/* Hidden form that will auto-submit to WebX Pay */}
      <form
        ref={formRef}
        action={checkoutUrl}
        method="POST"
        style={{ display: 'none' }}
      >
        {Object.entries(webxPayData).map(([key, value]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={value || ''}
          />
        ))}
      </form>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
