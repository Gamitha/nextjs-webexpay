import { ReactNode } from 'react';

export interface WebXPayConfig {
  apiUrl: string; // Backend API URL
  defaultCurrency?: string;
  timeout?: number;
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

export interface WebXPayWebhookData {
  orderId: string;
  referenceNumber: string;
  timestamp: string;
  statusCode: string;
  statusMessage: string;
  gatewayId: string;
  transactionAmount: string;
  requestedAmount?: string;
  customFields?: Record<string, string>;
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface PaymentState {
  status: PaymentStatus;
  loading: boolean;
  error: string | null;
  orderId: string | null;
  data: PaymentFormData | null;
}

export interface UseWebXPayOptions {
  onSuccess?: (data: PaymentResponse) => void;
  onError?: (error: string) => void;
  onPending?: () => void;
}

export interface WebXPayHookReturn {
  processPayment: (data: PaymentFormData) => Promise<void>;
  state: PaymentState;
  reset: () => void;
}

export interface WebXPayContextType {
  config: WebXPayConfig;
  processPayment: (data: PaymentFormData) => Promise<PaymentResponse>;
  getSupportedCurrencies: () => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
}

export interface WebXPayFormProps {
  onSubmit?: (data: PaymentFormData) => void;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  initialData?: Partial<PaymentFormData>;
  className?: string;
  showTitle?: boolean;
  title?: string;
  submitButtonText?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface WebXPayButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export interface WebXPayAutoSubmitProps {
  formData: WebXPayFormData;
  checkoutUrl: string;
  onSubmit?: () => void;
  className?: string;
}
