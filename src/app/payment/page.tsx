'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './payment.module.css';

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
  paymentGatewayId: string;
  multiplePaymentGatewayIds: string;
  cms: string;
  customFields: string;
  encMethod: string;
  amount: number;
  description?: string;
}

export default function Payment() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer_email@email.com',
    contactNumber: '0773606370',
    addressLineOne: '46/46, Green Lanka Building',
    addressLineTwo: 'Nawam Mawatha',
    city: 'Colombo',
    state: 'Western',
    postalCode: '10300',
    country: 'Sri Lanka',
    processCurrency: 'LKR',
    paymentGatewayId: '',
    multiplePaymentGatewayIds: '',
    cms: 'Next.js',
    customFields: '',
    encMethod: 'JCs3J+6oSz4V0LgE0zi/Bg==',
    amount: 100, // Default amount in cents (10.00)
    description: 'Payment for services'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [redirectToWebXPay, setRedirectToWebXPay] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (redirectToWebXPay) {
          // Create and submit form directly to WebX Pay
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = result.checkoutUrl;
          form.style.display = 'none';
          
          // Add all WebX Pay form fields
          Object.entries(result.webxPayData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string || '';
            form.appendChild(input);
          });
          
          // Add form to page and submit
          document.body.appendChild(form);
          
          console.log('Submitting to WebX Pay:', result.checkoutUrl);
          console.log('Form data:', result.webxPayData);
          
          form.submit();
          
          // Clean up
          document.body.removeChild(form);
        } else {
          // Demo mode - redirect to success page
          router.push(`/payment-success?orderId=${result.orderId}&amount=${result.amount}&currency=${result.currency}`);
        }
      } else {
        alert(`Payment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        <h1 className={styles.title}>Payment Details</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="contactNumber" className={styles.label}>Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Billing Address</h2>
            <div className={styles.formGroup}>
              <label htmlFor="addressLineOne" className={styles.label}>Address Line 1</label>
              <input
                type="text"
                id="addressLineOne"
                name="addressLineOne"
                value={formData.addressLineOne}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="addressLineTwo" className={styles.label}>Address Line 2</label>
              <input
                type="text"
                id="addressLineTwo"
                name="addressLineTwo"
                value={formData.addressLineTwo}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.label}>City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="state" className={styles.label}>State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.label}>Zip/Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment Information</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="amount" className={styles.label}>
                  Amount ({formData.processCurrency})
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="1"
                  step="1"
                  required
                />
                <small className={styles.helpText}>
                  Amount in cents (e.g., 100 = {formData.processCurrency} 10.00)
                </small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="processCurrency" className={styles.label}>Currency</label>
                <select
                  id="processCurrency"
                  name="processCurrency"
                  value={formData.processCurrency}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Payment Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={3}
                placeholder="Enter payment description"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment Settings</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="paymentGatewayId" className={styles.label}>Payment Gateway ID</label>
                <input
                  type="text"
                  id="paymentGatewayId"
                  name="paymentGatewayId"
                  value={formData.paymentGatewayId}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter gateway ID"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="multiplePaymentGatewayIds" className={styles.label}>
                  Multiple Gateway IDs
                </label>
                <input
                  type="text"
                  id="multiplePaymentGatewayIds"
                  name="multiplePaymentGatewayIds"
                  value={formData.multiplePaymentGatewayIds}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter IDs separated by |"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={redirectToWebXPay}
                  onChange={(e) => setRedirectToWebXPay(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Redirect to WebX Pay (uncheck for demo mode)
              </label>
              <small className={styles.helpText}>
                {redirectToWebXPay 
                  ? 'Will redirect to WebX Pay for actual payment processing' 
                  : 'Demo mode - will show success page without actual payment processing'
                }
              </small>
            </div>
          </div>

          <div className={styles.hiddenFields}>
            <input type="hidden" name="secret_key" value="630be963-59e2-447a-8f3b-93b3d7a3bf25" />
            <input type="hidden" name="cms" value={formData.cms} />
            <input type="hidden" name="enc_method" value={formData.encMethod} />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}