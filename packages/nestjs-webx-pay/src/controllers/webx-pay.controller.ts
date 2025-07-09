import { Body, Controller, Headers, HttpException, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentRequestDto } from '../dto/payment.dto';
import { PaymentResponse, WebXPayModuleConfig } from '../interfaces/webx-pay.interface';
import { WebXPayService } from '../services/webx-pay.service';

@Controller('webx-pay')
export class WebXPayController {
  constructor(
    private readonly webxPayService: WebXPayService,
    @Inject('WEBX_PAY_CONFIG') private readonly config: WebXPayModuleConfig
  ) { }

  /**
   * Process payment request
   */
  @Post('payment')
  async processPayment(@Body() paymentDto: PaymentRequestDto, @Req() req: Request,): Promise<PaymentResponse> {
    try {
      const result = await this.webxPayService.processPayment(paymentDto);

      if (!result.success) {
        throw new HttpException(
          { message: result.error, success: false },
          HttpStatus.BAD_REQUEST
        );
      }

      this.config.onPaymentInitiated?.(req, paymentDto);

      return result;
    } catch (error) {
      this.config.onPaymentInitiatedFailed?.(req, paymentDto);
      throw new HttpException(
        {
          message: error instanceof Error ? error.message : 'Payment processing failed',
          success: false
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  /**
   * Handle webhook notifications
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('content-type') contentType: string = 'application/x-www-form-urlencoded'
  ): Promise<any> {

    // WebX Pay sends data in the request body
    let webhookData: Record<string, any> = {};

    // Extract data from request body (this is the actual WebX Pay format)
    if (req.body && typeof req.body === 'object') {
      Object.entries(req.body).forEach(([key, value]) => {
        if (typeof value === 'string') {
          webhookData[key] = value;
        } else if (value !== null && value !== undefined) {
          webhookData[key] = value.toString();
        }
      });
    }

    // If body is empty, try query parameters as fallback
    if (Object.keys(webhookData).length === 0) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') {
          webhookData[key] = value;
        } else if (Array.isArray(value)) {
          webhookData[key] = value.join(', ');
        }
      });
    }

    // Decode the payment data if present
    let decodedPaymentData: Record<string, string> = {};
    if (webhookData.payment) {
      try {
        // Decode base64 payment data
        const decodedPayment = Buffer.from(webhookData.payment, 'base64').toString('utf8');
        //payment format: order_id|order_refference_number|date_time_transaction|payment_gateway_used|status_code|comment;
        // Split and map payment fields with fallback for missing fields
        const [orderId, referenceNumber, timestamp, gatewayId, statusCode, ...rest] = decodedPayment.split('|');
        decodedPaymentData = {
          orderId: orderId?.trim() || '',
          referenceNumber: referenceNumber?.trim() || '',
          timestamp: timestamp?.trim() || '',
          gatewayId: gatewayId?.trim() || '',
          statusCode: statusCode?.trim() || '',
          comment: rest.length > 0 ? rest.join('|').trim() : ''
        };

        webhookData.payment = decodedPaymentData;

        // Execute custom callback functions
        try {
          // Always call the general webhook callback if provided
          if (this.config.onWebhookReceived) {
            await this.config.onWebhookReceived(req, webhookData);
          }

          // Determine success/failure based on status code
          const isSuccess = webhookData.status_code === '00' ||
            decodedPaymentData.statusCode === '00';

          // Call specific success/failure callbacks based on status
          if (isSuccess) {
            if (this.config.onPaymentSuccess) {
              await this.config.onPaymentSuccess(req, webhookData);
            }
          } else {
            if (this.config.onPaymentFailure) {
              await this.config.onPaymentFailure(req, webhookData);
            }
          }
        } catch (callbackError) {
          console.error('Callback execution error:', callbackError);
          // Continue processing even if callback fails
        }

        // Check if redirect URLs are configured
        const hasRedirectUrls = this.config.redirectOnSuccess && this.config.redirectOnFailure;

        // Determine success/failure for redirect
        const isSuccess = webhookData.status_code === '00' ||
          decodedPaymentData.statusCode === '00';

        delete webhookData.signature;
        delete webhookData.custom_fields;
        if (!isSuccess) {
          if (hasRedirectUrls) {
            // Build failure redirect URL with error parameters
            res.redirect(
              this.webxPayService.appendParamsToUrl(
                this.config.redirectOnFailure!,
                webhookData
              )
            )
            return;
          } else {
            // Return JSON response
            return res.status(400).json({
              success: false,
              status: 'failed',
              data: webhookData,
              timestamp: new Date().toISOString()
            });
          }
        }

        if (hasRedirectUrls) {
          console.log();

          // Build success redirect URL with webhook data
          res.redirect(
              this.webxPayService.appendParamsToUrl(
                this.config.redirectOnSuccess!,
                webhookData
              )
            )
          return;
        } else {
          // Return JSON response
          return res.status(200).json({
            success: true,
            status: 'success',
            data: webhookData,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        const hasRedirectUrls = this.config.redirectOnSuccess && this.config.redirectOnFailure;

        if (hasRedirectUrls) {
          // Build failure redirect URL with error parameters
          const failureUrl = new URL(this.config.redirectOnFailure!);
          failureUrl.searchParams.set('status', 'error');
          failureUrl.searchParams.set('error', error instanceof Error ? error.message : 'Webhook processing failed');
          failureUrl.searchParams.set('timestamp', new Date().toISOString());

          res.redirect(failureUrl.toString());
          return;
        } else {
          // Return JSON error response
          return res.status(500).json({
            success: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Webhook processing failed',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

  }

}
