import { useState, useCallback } from 'react';
import { useWebXPayContext } from '../context';
import { 
  PaymentFormData, 
  PaymentStatus, 
  PaymentState, 
  UseWebXPayOptions,
  WebXPayHookReturn
} from '../types';

export const useWebXPay = (options: UseWebXPayOptions = {}): WebXPayHookReturn => {
  const context = useWebXPayContext();
  const { onSuccess, onError, onPending } = options;

  const [state, setState] = useState<PaymentState>({
    status: 'pending',
    loading: false,
    error: null,
    orderId: null,
    data: null
  });

  const processPayment = useCallback(async (data: PaymentFormData): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (onPending) {
      onPending();
    }

    try {
      const response = await context.processPayment(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          status: 'success',
          loading: false,
          orderId: response.orderId,
          data
        }));
        
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        loading: false,
        error: errorMessage
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [context, onSuccess, onError, onPending]);

  const reset = useCallback(() => {
    setState({
      status: 'pending',
      loading: false,
      error: null,
      orderId: null,
      data: null
    });
  }, []);

  return {
    processPayment,
    state,
    reset
  };
};
