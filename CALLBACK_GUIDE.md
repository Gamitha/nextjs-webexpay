# WebX Pay Callback Functions Guide

This guide explains how to use the callback functions in the WebX Pay NestJS package to implement custom business logic for payment events.

## Available Callback Functions

### 1. `onPaymentSuccess`
Called when a payment is successfully processed.

**Use Cases:**
- Update order status in database
- Send confirmation emails
- Update inventory
- Trigger fulfillment processes
- Send notifications to admin

### 2. `onPaymentFailure`
Called when a payment fails or is declined.

**Use Cases:**
- Update order status to failed
- Send failure notifications
- Log failures for analysis
- Trigger retry mechanisms
- Send alerts to admin

### 3. `onWebhookReceived`
Called for every webhook received (both success and failure).

**Use Cases:**
- General webhook logging
- Analytics and monitoring
- Audit trails
- Integration with third-party services

## Implementation Example

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebXPayModule, WebXPayWebhookData } from '@webx-pay/nestjs-backend';

@Module({
  imports: [
    WebXPayModule.forRootAsync({
      inject: [ConfigService, DatabaseService, EmailService],
      useFactory: (
        configService: ConfigService,
        databaseService: DatabaseService,
        emailService: EmailService
      ) => ({
        // ... other config options
        
        onPaymentSuccess: async (webhookData: WebXPayWebhookData) => {
          console.log('Payment Success:', webhookData);
          
          // Update order status
          await databaseService.updateOrder(webhookData.orderId, {
            status: 'paid',
            paymentReference: webhookData.referenceNumber,
            paidAt: new Date(webhookData.timestamp),
            transactionAmount: parseFloat(webhookData.transactionAmount),
            gatewayId: webhookData.gatewayId
          });
          
          // Send confirmation email
          const order = await databaseService.getOrder(webhookData.orderId);
          await emailService.sendConfirmation(order.customerEmail, {
            orderId: webhookData.orderId,
            amount: webhookData.transactionAmount,
            referenceNumber: webhookData.referenceNumber
          });
          
          // Update inventory
          await databaseService.updateInventory(order.items);
          
          // Trigger fulfillment
          await databaseService.createFulfillmentTask(webhookData.orderId);
        },
        
        onPaymentFailure: async (webhookData: WebXPayWebhookData) => {
          console.log('Payment Failure:', webhookData);
          
          // Update order status
          await databaseService.updateOrder(webhookData.orderId, {
            status: 'payment_failed',
            failureReason: webhookData.statusMessage,
            failedAt: new Date(webhookData.timestamp)
          });
          
          // Send failure notification
          const order = await databaseService.getOrder(webhookData.orderId);
          await emailService.sendPaymentFailure(order.customerEmail, {
            orderId: webhookData.orderId,
            failureReason: webhookData.statusMessage
          });
          
          // Log for analysis
          await databaseService.logPaymentFailure({
            orderId: webhookData.orderId,
            statusCode: webhookData.statusCode,
            statusMessage: webhookData.statusMessage,
            gatewayId: webhookData.gatewayId,
            timestamp: webhookData.timestamp
          });
        },
        
        onWebhookReceived: async (webhookData: WebXPayWebhookData) => {
          console.log('Webhook Received:', webhookData);
          
          // Log all webhook events for audit
          await databaseService.logWebhookEvent({
            orderId: webhookData.orderId,
            status: webhookData.statusCode,
            referenceNumber: webhookData.referenceNumber,
            amount: webhookData.transactionAmount,
            gateway: webhookData.gatewayId,
            receivedAt: new Date()
          });
          
          // Update analytics
          await analyticsService.trackPaymentEvent({
            event: webhookData.statusCode === '00' ? 'payment_success' : 'payment_failure',
            amount: parseFloat(webhookData.transactionAmount),
            currency: 'LKR', // or extract from webhook data
            gateway: webhookData.gatewayId
          });
          
          // Send to monitoring service
          await monitoringService.sendMetric('webhook_received', {
            orderId: webhookData.orderId,
            status: webhookData.statusCode
          });
        }
      })
    })
  ]
})
export class AppModule {}
```

## Webhook Data Structure

The `WebXPayWebhookData` object contains:

```typescript
{
  orderId: string;           // Your order ID
  referenceNumber: string;   // WebX Pay reference
  timestamp: string;         // Payment timestamp
  statusCode: string;        // Payment status code (00 = success)
  statusMessage: string;     // Human readable status
  gatewayId: string;         // Payment gateway used
  transactionAmount: string; // Final transaction amount
  requestedAmount?: string;  // Originally requested amount
  customFields?: object;     // Any custom fields sent
}
```

## Status Codes

Common WebX Pay status codes:
- `00` - Success
- `01` - Pending
- `02` - Failed
- `03` - Cancelled
- `04` - Expired

## Error Handling

Callback functions should handle errors gracefully:

```typescript
onPaymentSuccess: async (webhookData: WebXPayWebhookData) => {
  try {
    // Your business logic here
    await updateDatabase(webhookData);
    await sendEmail(webhookData);
  } catch (error) {
    // Log the error but don't throw
    console.error('Callback error:', error);
    // Optionally send to error tracking service
    await errorTracker.captureException(error, { webhookData });
  }
}
```

## Testing Callbacks

For testing, you can create mock webhook data:

```typescript
const mockWebhookData: WebXPayWebhookData = {
  orderId: 'TEST_ORDER_123',
  referenceNumber: 'WXP_REF_456',
  timestamp: new Date().toISOString(),
  statusCode: '00',
  statusMessage: 'Success',
  gatewayId: 'VISA',
  transactionAmount: '1500.00',
  requestedAmount: '1500.00'
};

// Test your callback
await onPaymentSuccess(mockWebhookData);
```

## Best Practices

1. **Keep callbacks fast** - Avoid long-running operations
2. **Handle errors gracefully** - Don't throw errors from callbacks
3. **Use async/await** - For database and API operations
4. **Log everything** - For debugging and monitoring
5. **Validate data** - Check webhook data before processing
6. **Idempotency** - Handle duplicate webhooks gracefully
7. **Retry logic** - For failed external API calls

## Database Integration Examples

### Prisma Example
```typescript
onPaymentSuccess: async (webhookData: WebXPayWebhookData) => {
  await prisma.order.update({
    where: { id: webhookData.orderId },
    data: {
      status: 'PAID',
      paymentReference: webhookData.referenceNumber,
      paidAt: new Date(webhookData.timestamp)
    }
  });
}
```

### TypeORM Example
```typescript
onPaymentSuccess: async (webhookData: WebXPayWebhookData) => {
  await orderRepository.update(webhookData.orderId, {
    status: OrderStatus.PAID,
    paymentReference: webhookData.referenceNumber,
    paidAt: new Date(webhookData.timestamp)
  });
}
```

### Mongoose Example
```typescript
onPaymentSuccess: async (webhookData: WebXPayWebhookData) => {
  await Order.findByIdAndUpdate(webhookData.orderId, {
    status: 'paid',
    paymentReference: webhookData.referenceNumber,
    paidAt: new Date(webhookData.timestamp)
  });
}
```
