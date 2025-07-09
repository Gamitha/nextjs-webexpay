export interface WebXPayConfig {
  checkoutUrl: string;
  secretKey: string;
  publicKey: string;
  encMethod: string;
  baseUrl: string;
  supportedCurrencies?: string[];
  redirectOnSuccess?: string;
  redirectOnFailure?: string;
}

export interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  processCurrency: string;
  paymentGatewayId?: string;
  multiplePaymentGatewayIds?: string;
  amount: number;
  description?: string;
  orderId?: string;
}

export interface WebXPayFormData {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  address_line_one: string;
  address_line_two?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  process_currency: string;
  payment_gateway_id?: string;
  multiple_payment_gateway_ids?: string;
  cms: string;
  custom_fields: string;
  enc_method: string;
  secret_key: string;
  payment: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
}

export interface WebXPayWebhookData {
  signature: string;
  payment: {
    orderId: string;
    referenceNumber: string;
    timestamp: string; // consider Date if you parse it later
    gatewayId: string;
    statusCode: string;
    comment: string;
  };
  status_code: string;
  order_refference_number: string;
  order_id: string;
  custom_fields: string;
  transaction_amount: string;
  requested_amount: string;
  additional_fee_discount_message: string;
}

export interface PaymentResponse {
  success: boolean;
  orderId: string;
  formData?: WebXPayFormData;
  checkoutUrl?: string;
  error?: string;
}

export interface WebhookResponse {
  success: boolean;
  orderId?: string;
  status?: string;
  error?: string;
  data?: WebXPayWebhookData;
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

// Callback function types for custom business logic
export type PaymentSuccessCallback = (webhookData: WebXPayWebhookData) => Promise<void> | void;
export type PaymentFailureCallback = (webhookData: WebXPayWebhookData) => Promise<void> | void;
export type PaymentWebhookCallback = (webhookData: WebXPayWebhookData) => Promise<void> | void;

export interface WebXPayModuleConfig {
  checkoutUrl: string;
  secretKey: string;
  publicKey: string;
  encMethod: string;
  baseUrl: string;
  supportedCurrencies?: string[];
  redirectOnSuccess?: string;
  redirectOnFailure?: string;
  disableDefaultController?: boolean;
  onPaymentSuccess?: any;
  onPaymentFailure?: any;
  onWebhookReceived?: any;
  onPaymentInitiated?: any;
  onPaymentInitiatedFailed?: any;
  additionalProviders?: any[];
  additionalServices?: any[];
}

export interface WebXPayService {
  validateConfig(config: Partial<WebXPayConfig>): { isValid: boolean; errors: string[] };
  validatePaymentData(data: PaymentFormData): { isValid: boolean; errors: string[] };
  generateOrderId(): string;
  encryptPaymentData(plaintext: string, publicKey: string): string;
  prepareCustomFields(data: PaymentFormData): string;
  transformToWebXPayData(data: PaymentFormData, config: WebXPayConfig, orderId: string, encryptedPayment: string): WebXPayFormData;
  processPayment(data: PaymentFormData): Promise<PaymentResponse>;
  processWebhook(body: string, contentType: string): Promise<WebhookResponse>;
  decodeCustomFields(customFields: string): Record<string, string>;
  decodePaymentData(payment: string): Record<string, string>;
}
