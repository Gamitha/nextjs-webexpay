import axios from 'axios';
import { PaymentFormData, PaymentResponse, WebXPayConfig } from '../types';
import { AxiosInstance } from 'axios';

export class WebXPayApiClient {
  private client: AxiosInstance;

  constructor(config: WebXPayConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any additional headers or authentication here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle authentication error
          console.error('Authentication error:', error.response.data);
        } else if (error.response?.status >= 500) {
          // Handle server errors
          console.error('Server error:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Process payment through the backend API
   */
  async processPayment(data: PaymentFormData): Promise<PaymentResponse> {
    try {
      const response = await this.client.post('/webx-pay/payment', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Payment processing failed'
        );
      }
      throw error;
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await this.client.get('/webx-pay/currencies');
      return response.data.currencies || [];
    } catch (error) {
      console.error('Failed to get supported currencies:', error);
      return ['LKR', 'USD', 'EUR', 'GBP']; // Default currencies
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; supportedCurrencies: string[] }> {
    try {
      const response = await this.client.get('/webx-pay/health');
      return response.data;
    } catch (error) {
      throw new Error('Health check failed');
    }
  }

  /**
   * Verify webhook data
   */
  async verifyWebhook(data: any): Promise<any> {
    try {
      const response = await this.client.post('/webx-pay/webhook/verify', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Webhook verification failed'
        );
      }
      throw error;
    }
  }
}
