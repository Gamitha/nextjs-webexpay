// Production-grade logging utility for WebX Pay integration
import { NextRequest } from 'next/server';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security',
  AUDIT = 'audit'
}

interface LogContext {
  userId?: string;
  orderId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  transactionId?: string;
  amount?: number | string;
  currency?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

class ProductionLogger {
  private serviceName: string;
  private version: string;
  private environment: string;

  constructor(serviceName: string = 'webx-pay-integration') {
    this.serviceName = serviceName;
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as unknown as Error : undefined,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      version: this.version,
      environment: this.environment
    };
  }

  private log(entry: LogEntry): void {
    // In production, you might want to send logs to external services
    // like DataDog, New Relic, CloudWatch, etc.
    const logOutput = {
      ...entry,
      // Sanitize sensitive data
      context: this.sanitizeContext(entry.context)
    };

    // Console output for development/debugging
    if (this.environment === 'development') {
      console.log(JSON.stringify(logOutput, null, 2));
    } else {
      // Single line JSON for production log aggregation
      console.log(JSON.stringify(logOutput));
    }

    // In production, add integrations here:
    // - Send to log aggregation service
    // - Store in database for audit trail
    // - Send alerts for ERROR/SECURITY levels
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    // Remove or mask sensitive information
    const sanitized = { ...context };
    
    // Mask sensitive payment data
    if (sanitized.payment && typeof sanitized.payment === 'string') {
      sanitized.payment = `***${sanitized.payment.slice(-4)}`;
    }
    
    if (sanitized.secret_key) {
      sanitized.secret_key = '***REDACTED***';
    }

    if (sanitized.signature && typeof sanitized.signature === 'string') {
      sanitized.signature = `***${sanitized.signature.slice(-8)}`;
    }

    // Mask personal information (GDPR compliance)
    if (sanitized.email && typeof sanitized.email === 'string') {
      const [local, domain] = sanitized.email.split('@');
      sanitized.email = `${local.slice(0, 2)}***@${domain}`;
    }

    if (sanitized.phone && typeof sanitized.phone === 'string') {
      sanitized.phone = `***${sanitized.phone.slice(-4)}`;
    }

    return sanitized;
  }

  // Extract context from Next.js request
  private extractRequestContext(request: NextRequest): LogContext {
    const headers = request.headers;
    const url = new URL(request.url);
    
    return {
      ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
      sessionId: headers.get('x-session-id') || undefined,
      path: url.pathname,
      method: request.method,
      referer: headers.get('referer') || undefined
    };
  }

  // Debug level logging
  debug(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  // Info level logging
  info(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.INFO, message, context));
  }

  // Warning level logging
  warn(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.WARN, message, context));
  }

  // Error level logging
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.ERROR, message, context, error));
  }

  // Security-related logging
  security(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.SECURITY, message, context));
  }

  // Audit trail logging
  audit(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.AUDIT, message, context));
  }

  // Payment-specific logging methods
  paymentInitiated(orderId: string, amount: number, currency: string, request: NextRequest): void {
    const context = {
      ...this.extractRequestContext(request),
      orderId,
      amount,
      currency,
      action: 'payment_initiated'
    };
    
    this.audit('Payment initiated', context);
  }

  paymentDataPrepared(orderId: string, amount: number, currency: string, encryptedLength: number): void {
    const context = {
      orderId,
      amount,
      currency,
      encryptedLength,
      action: 'payment_data_prepared'
    };
    
    this.info('Payment data prepared and encrypted', context);
  }

  paymentRedirect(orderId: string, checkoutUrl: string): void {
    const context = {
      orderId,
      checkoutUrl,
      action: 'payment_redirect'
    };
    
    this.audit('Payment redirect to WebX Pay', context);
  }

  webhookReceived(orderId: string, statusCode: string, amount: string, request: NextRequest): void {
    const context = {
      ...this.extractRequestContext(request),
      orderId,
      statusCode,
      amount,
      action: 'webhook_received'
    };
    
    this.audit('WebX Pay webhook received', context);
  }

  paymentSuccess(orderId: string, referenceNumber: string, amount: string): void {
    const context = {
      orderId,
      referenceNumber,
      amount,
      action: 'payment_success'
    };
    
    this.audit('Payment completed successfully', context);
  }

  paymentFailure(orderId: string, statusCode: string, amount: string, reason?: string): void {
    const context = {
      orderId,
      statusCode,
      amount,
      reason,
      action: 'payment_failure'
    };
    
    this.warn('Payment failed', context);
  }

  validationError(message: string, errors: string[], request: NextRequest): void {
    const context = {
      ...this.extractRequestContext(request),
      errors,
      action: 'validation_error'
    };
    
    this.warn(`Validation error: ${message}`, context);
  }

  encryptionError(orderId: string, error: Error): void {
    const context = {
      orderId,
      action: 'encryption_error'
    };
    
    this.error('Payment data encryption failed', error, context);
  }

  webhookProcessingError(error: Error, rawData?: string): void {
    const context = {
      rawDataLength: rawData?.length || 0,
      action: 'webhook_processing_error'
    };
    
    this.error('Webhook processing failed', error, context);
  }

  securityAlert(message: string, context?: LogContext): void {
    this.security(`SECURITY ALERT: ${message}`, {
      ...context,
      severity: 'high',
      requiresInvestigation: true
    });
  }

  performanceMetric(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance metric: ${operation}`, {
      ...context,
      operation,
      duration_ms: duration,
      action: 'performance_metric'
    });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Performance measurement utility
export class PerformanceTimer {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  end(context?: LogContext): void {
    const duration = Date.now() - this.startTime;
    logger.performanceMetric(this.operation, duration, context);
  }
}

// Utility for async operations with automatic logging
export async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const timer = new PerformanceTimer(operation);
  
  try {
    logger.debug(`Starting ${operation}`, context);
    const result = await fn();
    logger.debug(`Completed ${operation}`, context);
    return result;
  } catch (error) {
    logger.error(`Failed ${operation}`, error as Error, context);
    throw error;
  } finally {
    timer.end(context);
  }
}
