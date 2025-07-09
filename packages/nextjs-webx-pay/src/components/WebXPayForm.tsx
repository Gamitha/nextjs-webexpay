import React, { useState, useEffect } from 'react';
import { useWebXPay } from '../hooks';
import { PaymentFormData, WebXPayFormProps } from '../types';

export const WebXPayForm: React.FC<WebXPayFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  initialData = {},
  className = '',
  showTitle = true,
  title = 'Payment Information',
  submitButtonText = 'Pay Now',
  disabled = false,
  loading = false
}) => {
  const { processPayment, state } = useWebXPay({
    onSuccess,
    onError
  });

  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    addressLineOne: '',
    addressLineTwo: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    processCurrency: 'LKR',
    amount: 0,
    description: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber || formData.contactNumber.trim().length < 10) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    if (!formData.addressLineOne || formData.addressLineOne.trim().length < 5) {
      newErrors.addressLineOne = 'Address must be at least 5 characters';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required';
    }

    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode || formData.postalCode.trim().length < 2) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country || formData.country.trim().length < 2) {
      newErrors.country = 'Country is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }

    try {
      await processPayment(formData);
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormLoading = loading || state.loading;

  return (
    <div className={`webx-pay-form ${className}`}>
      {showTitle && <h2>{title}</h2>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          
          <div className="form-field">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={disabled || isFormLoading}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="contactNumber">Contact Number *</label>
          <input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleInputChange('contactNumber')}
            disabled={disabled || isFormLoading}
            required
          />
          {errors.contactNumber && <span className="error">{errors.contactNumber}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="addressLineOne">Address Line 1 *</label>
          <input
            id="addressLineOne"
            type="text"
            value={formData.addressLineOne}
            onChange={handleInputChange('addressLineOne')}
            disabled={disabled || isFormLoading}
            required
          />
          {errors.addressLineOne && <span className="error">{errors.addressLineOne}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="addressLineTwo">Address Line 2</label>
          <input
            id="addressLineTwo"
            type="text"
            value={formData.addressLineTwo}
            onChange={handleInputChange('addressLineTwo')}
            disabled={disabled || isFormLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange('city')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={handleInputChange('state')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="postalCode">Postal Code *</label>
            <input
              id="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleInputChange('postalCode')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.postalCode && <span className="error">{errors.postalCode}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="country">Country *</label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={handleInputChange('country')}
            disabled={disabled || isFormLoading}
            required
          />
          {errors.country && <span className="error">{errors.country}</span>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="amount">Amount *</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              disabled={disabled || isFormLoading}
              required
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="processCurrency">Currency *</label>
            <select
              id="processCurrency"
              value={formData.processCurrency}
              onChange={handleInputChange('processCurrency')}
              disabled={disabled || isFormLoading}
              required
            >
              <option value="LKR">LKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange('description')}
            disabled={disabled || isFormLoading}
            placeholder="Optional payment description"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={disabled || isFormLoading}
            className="webx-pay-submit-button"
          >
            {isFormLoading ? 'Processing...' : submitButtonText}
          </button>
        </div>
      </form>

      {state.error && (
        <div className="webx-pay-error">
          {state.error}
        </div>
      )}
    </div>
  );
};
