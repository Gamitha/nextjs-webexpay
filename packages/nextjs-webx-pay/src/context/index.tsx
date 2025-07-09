import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WebXPayApiClient } from '../api/client';
import { WebXPayConfig, PaymentFormData, PaymentResponse, WebXPayContextType } from '../types';

const WebXPayContext = createContext<WebXPayContextType | null>(null);

export interface WebXPayProviderProps {
  children: ReactNode;
  config: WebXPayConfig;
}

export const WebXPayProvider: React.FC<WebXPayProviderProps> = ({ children, config }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiClient] = useState(() => new WebXPayApiClient(config));

  const processPayment = useCallback(async (data: PaymentFormData): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.processPayment(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const getSupportedCurrencies = useCallback(async (): Promise<string[]> => {
    try {
      return await apiClient.getSupportedCurrencies();
    } catch (err) {
      console.error('Failed to get supported currencies:', err);
      return ['LKR', 'USD', 'EUR', 'GBP']; // Default fallback
    }
  }, [apiClient]);

  const contextValue: WebXPayContextType = {
    config,
    processPayment,
    getSupportedCurrencies,
    isLoading,
    error,
  };

  return (
    <WebXPayContext.Provider value={contextValue}>
      {children}
    </WebXPayContext.Provider>
  );
};

export const useWebXPayContext = (): WebXPayContextType => {
  const context = useContext(WebXPayContext);
  if (!context) {
    throw new Error('useWebXPayContext must be used within a WebXPayProvider');
  }
  return context;
};
