import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentFailure() {
  const router = useRouter();
  const [errorData, setErrorData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Extract all query parameters from the URL
    const query = router.query;
    const data: Record<string, string> = {};
    
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value;
      } else if (Array.isArray(value)) {
        data[key] = value.join(', ');
      }
    });
    
    setErrorData(data);
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Payment Failed - WebX Pay Demo</title>
        <meta name="description" content="Payment processing failed" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          color: '#721c24',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid',
          borderRadius: '5px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ Payment Failed</h1>
          <p style={{ margin: 0 }}>
            {errorData.error || 'Your payment could not be processed. Please try again.'}
          </p>
        </div>

        {Object.keys(errorData).length > 0 && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>Error Details</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(errorData).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <strong style={{ color: '#495057' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </strong>
                  <span style={{ 
                    color: key === 'error' ? '#dc3545' : '#6c757d', 
                    wordBreak: 'break-all' 
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Try Again
          </button>
          
          <button
            onClick={() => console.log('Error Data:', errorData)}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            View Error Details
          </button>
        </div>

        {Object.keys(errorData).length === 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7',
            color: '#856404',
            padding: '15px',
            marginTop: '20px',
            border: '1px solid',
            borderRadius: '5px'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Note:</strong> No error data received in URL parameters. 
              This might be a direct navigation to this page.
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: '#e2e3e5',
          border: '1px solid #d6d8db',
          borderRadius: '5px',
          padding: '15px',
          marginTop: '20px'
        }}>
          <h4 style={{ marginTop: 0 }}>Common Reasons for Payment Failure:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Insufficient funds in your account</li>
            <li>Invalid card details</li>
            <li>Network connectivity issues</li>
            <li>Payment gateway timeout</li>
            <li>Security restrictions by your bank</li>
          </ul>
        </div>
      </main>
    </>
  );
}
