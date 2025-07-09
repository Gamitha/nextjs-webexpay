// Main module export
export { WebXPayModule } from './webx-pay.module';

// Service export
export { WebXPayService } from './services/webx-pay.service';

// Controller export
export { WebXPayController } from './controllers/webx-pay.controller';

// DTO exports
export { PaymentRequestDto, WebhookRequestDto } from './dto/payment.dto';

// Interface exports
export type {
  WebXPayConfig,
  PaymentFormData,
  WebXPayFormData,
  WebXPayWebhookData,
  PaymentResponse,
  WebhookResponse,
  PaymentStatus,
  WebXPayModuleConfig,
  WebXPayService as IWebXPayService
} from './interfaces/webx-pay.interface';

// Decorator exports
export { InjectWebXPayConfig, InjectWebXPayService } from './decorators/webx-pay.decorator';

// Module async options
export type { WebXPayModuleAsyncOptions } from './webx-pay.module';
