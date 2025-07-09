import React, { useState } from 'react';
import Head from 'next/head';

interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  processCurrency: string;
  amount: number;
  description: string;
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+94771234567',
    addressLineOne: '123 Main St',
    addressLineTwo: 'Apt 4B',
    city: 'Colombo',
    state: 'Western Province',
    postalCode: '00100',
    country: 'Sri Lanka',
    processCurrency: 'LKR',
    amount: 1500,
    description: 'Demo Product Purchase'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:3000/webx-pay/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Payment successful:', result);
        alert('Payment form submitted successfully! Check console for details.');
        
        // In a real implementation, you would redirect to WebX Pay:
        if (result.formData && result.checkoutUrl) {
          console.log('Redirecting to WebX Pay with form data:', result.formData);
          
          // Create and submit form to WebX Pay
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = result.checkoutUrl;
          form.style.display = 'none';
          
          // Add all form fields
          Object.entries(result.formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = (value as string) || '';
            form.appendChild(input);
          });

          console.log('Prepared form data for WebX Pay:', result.formData);

          // Add form to body and submit
          document.body.appendChild(form);
          
          try {
            form.submit();
          } catch (submitError) {
            console.error('Form submission error:', submitError);
            alert('Failed to redirect to payment gateway. Please try again.');
            document.body.removeChild(form);
          }
        } else {
          console.log('Payment data received but no redirect URL provided');
          alert('Payment data processed but no redirect URL available.');
        }
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Head>
        <title>WebX Pay Demo</title>
        <meta name="description" content="WebX Pay integration demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>WebX Pay Demo</h1>
        <p>This is a demo showing how to use the WebX Pay packages.</p>
        
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>First Name:</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Last Name:</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Contact Number:</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={handleInputChange('contactNumber')}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Address Line 1:</label>
            <input
              type="text"
              value={formData.addressLineOne}
              onChange={handleInputChange('addressLineOne')}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>City:</label>
              <input
                type="text"
                value={formData.city}
                onChange={handleInputChange('city')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>State:</label>
              <input
                type="text"
                value={formData.state}
                onChange={handleInputChange('state')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Postal Code:</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={handleInputChange('postalCode')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Country:</label>
              <input
                type="text"
                value={formData.country}
                onChange={handleInputChange('country')}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Currency:</label>
              <select
                value={formData.processCurrency}
                onChange={handleInputChange('processCurrency')}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="LKR">LKR - Sri Lankan Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label>Amount:</label>
              <input
                type="number"
                value={formData.amount}
                onChange={handleInputChange('amount')}
                min="0"
                step="0.01"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <input
              type="text"
              value={formData.description}
              onChange={handleInputChange('description')}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isProcessing ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h3>Demo Instructions:</h3>
          <ol>
            <li>Fill in the payment form above</li>
            <li>Click "Pay Now" to simulate payment processing</li>
            <li>Check the browser console for the payment data</li>
            <li>In a real implementation, this would redirect to WebX Pay gateway</li>
          </ol>
          
          <h3>Backend API:</h3>
          <p>The backend is running at: <code>http://localhost:3000</code></p>
          <p>Available endpoints:</p>
          <ul>
            <li><code>POST /webx-pay/payment</code> - Process payment</li>
            <li><code>GET /webx-pay/health</code> - Health check</li>
            <li><code>GET /webx-pay/currencies</code> - Supported currencies</li>
          </ul>
        </div>
      </main>
    </>
  );
}
