import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PaymentFormData,
  PaymentResponse,
  WebXPayConfig,
  WebXPayFormData,
  WebXPayModuleConfig
} from '../interfaces/webx-pay.interface';

@Injectable()
export class WebXPayService {
  constructor(
    @Inject('WEBX_PAY_CONFIG') private readonly config: WebXPayModuleConfig
  ) { }

  /**
   * Validate WebX Pay configuration
   */
  validateConfig(config: Partial<WebXPayConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.checkoutUrl) {
      errors.push('Checkout URL is required');
    } else {
      try {
        new URL(config.checkoutUrl);
      } catch {
        errors.push('Checkout URL must be a valid URL');
      }
    }

    if (!config.secretKey) {
      errors.push('Secret key is required');
    } else if (config.secretKey.length < 10) {
      errors.push('Secret key must be at least 10 characters long');
    }

    if (!config.publicKey) {
      console.warn('Public key is missing - encryption will use base64 encoding');
    } else if (!config.publicKey.includes('BEGIN PUBLIC KEY') || !config.publicKey.includes('END PUBLIC KEY')) {
      console.warn('Public key format may be invalid - encryption might fail');
    }

    if (!config.encMethod) {
      errors.push('Encryption method is required');
    }

    if (!config.baseUrl) {
      errors.push('Base URL is required');
    } else {
      try {
        new URL(config.baseUrl);
      } catch {
        errors.push('Base URL must be a valid URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payment form data
   */
  validatePaymentData(data: PaymentFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email address is required');
    }

    if (!data.contactNumber || data.contactNumber.trim().length < 10) {
      errors.push('Valid contact number is required');
    }

    if (!data.amount || data.amount < 1) {
      errors.push('Amount must be greater than 0');
    }

    if (!data.processCurrency) {
      errors.push('Currency is required');
    }

    if (!data.addressLineOne || data.addressLineOne.trim().length < 5) {
      errors.push('Address line 1 must be at least 5 characters long');
    }

    if (!data.city || data.city.trim().length < 2) {
      errors.push('City is required');
    }

    if (!data.country || data.country.trim().length < 2) {
      errors.push('Country is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
  }

  /**
   * Encrypt payment data using RSA public key
   */
  encryptPaymentData(plaintext: string, publicKey: string): string {
    console.log('Encrypting payment data:', plaintext);

    try {
      // If no public key is provided, return base64 encoded data (for testing)
      if (!publicKey || publicKey.trim() === '') {
        console.warn('No public key provided, using base64 encoding for testing');
        return Buffer.from(plaintext, 'utf8').toString('base64');
      }

      const buffer = Buffer.from(plaintext, 'utf8');
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
      );

      return encrypted.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to base64 encoding if encryption fails
      console.warn('Encryption failed, using base64 encoding as fallback');
      return Buffer.from(plaintext, 'utf8').toString('base64');
    }
  }

  /**
   * Prepare custom fields for WebX Pay
   */
  prepareCustomFields(data: PaymentFormData): string {
    const customFields = [
      `name:${data.firstName} ${data.lastName}`,
      `email:${data.email}`,
      `phone:${data.contactNumber}`,
      `address:${data.addressLineOne}, ${data.city}`
    ].join('|');

    return Buffer.from(customFields, 'utf8').toString('base64');
  }

  /**
   * Transform PaymentFormData to WebXPayFormData
   */
  transformToWebXPayData(
    data: PaymentFormData,
    config: WebXPayConfig,
    encryptedPayment: string
  ): WebXPayFormData {
    const customFields = this.prepareCustomFields(data);

    return {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      contact_number: data.contactNumber,
      address_line_one: data.addressLineOne,
      address_line_two: data.addressLineTwo || '',
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
      process_currency: data.processCurrency,
      // payment_gateway_id: '40',
      //   multiple_payment_gateway_ids: data.multiplePaymentGatewayIds || '',
      cms: 'NestJS WebX Pay Module',
      custom_fields: customFields,
      enc_method: config.encMethod,
      secret_key: config.secretKey,
      payment: encryptedPayment,
      return_url: `${config.baseUrl}/payment-success`,
      cancel_url: `${config.baseUrl}/payment-failure`,
      notify_url: `${config.baseUrl}/webx-pay/webhook`
    };
  }

  /**
   * Process payment request
   */
  async processPayment(data: PaymentFormData): Promise<PaymentResponse> {
    try {
      // Validate configuration
      const configValidation = this.validateConfig(this.config);
      if (!configValidation.isValid) {
        return {
          success: false,
          orderId: '',
          error: `Configuration error: ${configValidation.errors.join(', ')}`
        };
      }

      // Validate payment data
      const dataValidation = this.validatePaymentData(data);
      if (!dataValidation.isValid) {
        return {
          success: false,
          orderId: '',
          error: `Validation error: ${dataValidation.errors.join(', ')}`
        };
      }

      // Generate order ID if not provided
      const orderId = data.orderId || this.generateOrderId();

      // Prepare payment data for encryption
      const paymentData = [
        orderId,
        data.amount.toString()
      ].join('|');

      // Encrypt payment data
      const encryptedPayment = this.encryptPaymentData(paymentData, this.config.publicKey);

      // Transform to WebX Pay format
      const formData = this.transformToWebXPayData(data, this.config, encryptedPayment);

      return {
        success: true,
        orderId,
        formData,
        checkoutUrl: this.config.checkoutUrl
      };
    } catch (error) {
      return {
        success: false,
        orderId: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }


  appendParamsToUrl(url: string, params: Record<string, any>): string {
    const resultUrl = new URL(url);
    for (const [key, value] of Object.entries(params)) {
      resultUrl.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
    return resultUrl.toString();
  }
}
