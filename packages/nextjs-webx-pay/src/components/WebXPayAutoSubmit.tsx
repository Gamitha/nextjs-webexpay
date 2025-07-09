import React, { useEffect, useRef } from 'react';
import { WebXPayAutoSubmitProps } from '../types';

export const WebXPayAutoSubmit: React.FC<WebXPayAutoSubmitProps> = ({
  formData,
  checkoutUrl,
  onSubmit,
  className = ''
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    // Auto-submit the form when component mounts
    if (formRef.current && !submittedRef.current) {
      submittedRef.current = true;
      
      if (onSubmit) {
        onSubmit();
      }
      
      // Small delay to ensure form is in DOM
      setTimeout(() => {
        formRef.current?.submit();
      }, 100);
    }
  }, [onSubmit]);

  return (
    <div className={`webx-pay-auto-submit ${className}`}>
      <div className="webx-pay-loading">
        <div className="webx-pay-spinner" />
        <p>Redirecting to payment gateway...</p>
      </div>
      
      <form
        ref={formRef}
        method="POST"
        action={checkoutUrl}
        style={{ display: 'none' }}
      >
        {Object.entries(formData).map(([key, value]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={value || ''}
          />
        ))}
      </form>
    </div>
  );
};
