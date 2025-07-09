import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentSuccess() {
  const router = useRouter();
  const [webhookData, setWebhookData] = useState<Record<string, string>>({});

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
    
    setWebhookData(data);
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Payment Success - WebX Pay Demo</title>
        <meta name="description" content="Payment completed successfully" />
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
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid',
          borderRadius: '5px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ Payment Successful!</h1>
          <p style={{ margin: 0 }}>Your payment has been processed successfully.</p>
        </div>

        {Object.keys(webhookData).length > 0 && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>Payment Details</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(webhookData).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <strong style={{ color: '#495057' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </strong>
                  <span style={{ color: '#6c757d', wordBreak: 'break-all' }}>{value}</span>
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
            Make Another Payment
          </button>
          
          <button
            onClick={() => console.log('Webhook Data:', webhookData)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            View in Console
          </button>
        </div>

        {Object.keys(webhookData).length === 0 && (
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
              <strong>Note:</strong> No webhook data received in URL parameters. 
              This might be a direct navigation to this page.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
