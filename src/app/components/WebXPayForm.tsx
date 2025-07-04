'use client';

import { useEffect, useRef } from 'react';

interface WebXPayFormProps {
  checkoutUrl: string;
  // Standard WebX Pay form data based on official integration guide
  formData: {
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
  };
}

export default function WebXPayForm({ checkoutUrl, formData }: WebXPayFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Auto-submit the form when component mounts
    if (formRef.current) {
      console.log('Submitting form to:', checkoutUrl);
      console.log('Form data:', formData);
      formRef.current.submit();
    }
  }, [checkoutUrl, formData]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        
        <h2 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.5rem' }}>
          Redirecting to WebX Pay
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Please wait while we redirect you to the secure payment page.
        </p>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <p><strong>Customer:</strong> {formData.first_name} {formData.last_name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Currency:</strong> {formData.process_currency}</p>
        </div>
        
        <form
          ref={formRef}
          action={checkoutUrl}
          method="POST"
          style={{ display: 'none' }}
        >
          {Object.entries(formData).map(([key, value]) => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={String(value || '')}
            />
          ))}
        </form>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
