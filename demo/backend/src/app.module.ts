import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebXPayModule, WebXPayWebhookData } from '@orenda-inc/nestjs-webx-pay';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    WebXPayModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        checkoutUrl: configService.get('WEBX_PAY_CHECKOUT_URL'),
        secretKey: configService.get('WEBX_PAY_SECRET_KEY'),
        publicKey: configService.get('WEBX_PAY_PUBLIC_KEY'),
        encMethod: configService.get('WEBX_PAY_ENC_METHOD'),
        baseUrl: configService.get('NEXT_PUBLIC_BASE_URL'),
        supportedCurrencies: ['LKR', 'USD'],
        redirectOnSuccess: configService.get('WEBX_PAY_REDIRECT_ON_SUCCESS'),
        redirectOnFailure: configService.get('WEBX_PAY_REDIRECT_ON_FAILURE'),
        
        // Custom business logic callbacks
        onPaymentSuccess: async (req, webhookData: WebXPayWebhookData) => {
          console.log('🎉 Payment Success Callback:', webhookData);
          // Add your business logic here:
          // - Update database
          // - Send confirmation email
          // - Update inventory
          // - Trigger fulfillment
          // Example:
          // await updateOrderStatus(webhookData.orderId, 'paid');
          // await sendConfirmationEmail(webhookData.orderId);
        },
        
        onPaymentFailure: async (req, webhookData: WebXPayWebhookData) => {
          console.log('❌ Payment Failure Callback:', webhookData);
          // Add your business logic here:
          // - Update database with failure status
          // - Send failure notification
          // - Log failure for analysis
          // Example:
          // await updateOrderStatus(webhookData.orderId, 'failed');
          // await logPaymentFailure(webhookData);
        },
        
        onWebhookReceived: async (req, webhookData: WebXPayWebhookData) => {
          console.log('📨 Webhook Received Callback:', webhookData);
          // Add your general webhook processing logic here:
          // - Log all webhook events
          // - Update analytics
          // - Notify monitoring systems
          // Example:
          // await logWebhookEvent(webhookData);
          // await updateAnalytics(webhookData);
        }
      })
    })
  ]
})
export class AppModule {}
