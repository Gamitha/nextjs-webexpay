import { NextRequest, NextResponse } from 'next/server';
import { logger, PerformanceTimer } from '@/lib/logger';

interface WebXPayWebhookData {
  order_id: string;
  order_refference_number: string;
  status_code: string;
  transaction_amount: string;
  requested_amount: string;
  payment: string;
  custom_fields: string;
  signature: string;
  additional_fee_discount_message?: string;
  [key: string]: string | undefined;
}

// Handle WebX Pay webhook notifications
export async function POST(request: NextRequest) {
  const timer = new PerformanceTimer('webhook_processing');
  let rawBody = '';
  
  try {
    let webhookData: WebXPayWebhookData;
    
    // Get the raw body first to log it
    rawBody = await request.text();
    
    // Log webhook reception
    logger.info('WebX Pay webhook received', {
      contentLength: rawBody.length,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    logger.debug('Raw webhook body received', {
      bodyLength: rawBody.length,
      contentType: request.headers.get('content-type') || 'unknown'
    });
    
    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Parse as JSON
      webhookData = JSON.parse(rawBody);
      logger.debug('Parsed webhook as JSON');
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse as form data
      const formData = new URLSearchParams(rawBody);
      webhookData = {} as WebXPayWebhookData;
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
      logger.debug('Parsed webhook as form data');
    } else {
      // Try to parse as form data by default (most common for webhooks)
      const formData = new URLSearchParams(rawBody);
      webhookData = {} as WebXPayWebhookData;
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
      logger.debug('Parsed webhook as default form data');
    }
    
    // ... rest of the existing code ...
    
    // Log webhook reception with order details
    logger.webhookReceived(
      webhookData.order_id || 'unknown',
      webhookData.status_code || 'unknown',
      webhookData.transaction_amount || 'unknown',
      request
    );
    
    // Basic validation
    if (!webhookData.order_id || !webhookData.status_code) {
      logger.warn('Invalid webhook data: missing required fields', {
        hasOrderId: !!webhookData.order_id,
        hasStatusCode: !!webhookData.status_code,
        receivedFields: Object.keys(webhookData)
      });
      
      return NextResponse.json(
        { success: false, message: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Decode custom fields (base64 encoded)
    const decodedCustomFields: Record<string, string> = {};
    try {
      const customFieldsDecoded = Buffer.from(webhookData.custom_fields, 'base64').toString('utf-8');
      logger.debug('Decoded custom fields', {
        originalLength: webhookData.custom_fields.length,
        decodedLength: customFieldsDecoded.length
      });
      
      // Parse custom fields (format: name:John Doe|email:test@test.com|phone:123|address:123 Street)
      const customFieldPairs = customFieldsDecoded.split('|');
      customFieldPairs.forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value) {
          decodedCustomFields[key] = value;
        }
      });
      
      logger.debug('Parsed custom fields', {
        fieldCount: Object.keys(decodedCustomFields).length,
        fields: Object.keys(decodedCustomFields)
      });
    } catch (error) {
      logger.warn('Error decoding custom fields', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customFieldsLength: webhookData.custom_fields?.length || 0
      });
    }

    // Decode payment data (base64 encoded)
    const decodedPaymentData: Record<string, string> = {};
    try {
      const paymentDecoded = Buffer.from(webhookData.payment, 'base64').toString('utf-8');
      logger.debug('Decoded payment data', {
        originalLength: webhookData.payment.length,
        decodedLength: paymentDecoded.length
      });
      
      // Parse payment data (format appears to be pipe-separated)
      const paymentParts = paymentDecoded.split('|');
      if (paymentParts.length >= 7) {
        decodedPaymentData.orderId = paymentParts[0];
        decodedPaymentData.referenceNumber = paymentParts[1];
        decodedPaymentData.timestamp = paymentParts[2];
        decodedPaymentData.statusCode = paymentParts[3];
        decodedPaymentData.statusMessage = paymentParts[4];
        decodedPaymentData.gatewayId = paymentParts[5];
        decodedPaymentData.transactionAmount = paymentParts[6];
        if (paymentParts[7]) {
          decodedPaymentData.requestedAmount = paymentParts[7];
        }
        
        logger.debug('Parsed payment data', {
          partsCount: paymentParts.length,
          statusCode: decodedPaymentData.statusCode,
          statusMessage: decodedPaymentData.statusMessage
        });
      }
    } catch (error) {
      logger.warn('Error decoding payment data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentDataLength: webhookData.payment?.length || 0
      });
    }

    // Log the complete webhook data for audit
    logger.audit('Webhook processing details', {
      orderId: webhookData.order_id,
      referenceNumber: webhookData.order_refference_number,
      statusCode: webhookData.status_code,
      transactionAmount: webhookData.transaction_amount,
      requestedAmount: webhookData.requested_amount,
      hasSignature: !!webhookData.signature,
      signatureLength: webhookData.signature?.length || 0,
      customFieldsDecoded: Object.keys(decodedCustomFields).length > 0,
      paymentDataDecoded: Object.keys(decodedPaymentData).length > 0
    });

    // Process payment based on status code
    // WebX Pay uses status codes: '00' = success, other codes = failure
    switch (webhookData.status_code) {
      case '00':
        await handleSuccessfulPayment(webhookData);
        break;
        
      default:
        await handleFailedPayment(webhookData);
        break;
    }

    // Return success response to WebX Pay
    const response = { 
      success: true, 
      message: 'Webhook processed successfully',
      order_id: webhookData.order_id,
      status_code: webhookData.status_code,
      reference_number: webhookData.order_refference_number,
      timestamp: new Date().toISOString()
    };
    
    logger.info('Webhook processing completed successfully', {
      orderId: webhookData.order_id,
      statusCode: webhookData.status_code
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    logger.webhookProcessingError(error as Error, rawBody);
    
    const errorResponse = { 
      success: false, 
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    timer.end();
  }
}

async function handleSuccessfulPayment(data: WebXPayWebhookData) {
  logger.paymentSuccess(
    data.order_id,
    data.order_refference_number,
    data.transaction_amount
  );
  
  // Log detailed success information
  logger.audit('Payment success details', {
    orderId: data.order_id,
    referenceNumber: data.order_refference_number,
    transactionAmount: data.transaction_amount,
    requestedAmount: data.requested_amount,
    statusCode: data.status_code,
    hasSignature: !!data.signature,
    additionalFeeMessage: data.additional_fee_discount_message
  });
  
  // Here you would typically:
  // 1. Update your database with the successful payment
  // 2. Send confirmation emails
  // 3. Update order status
  // 4. Trigger fulfillment processes
  
  // Example database update (pseudo-code):
  // await updatePaymentStatus(data.order_id, 'completed', data.order_refference_number);
  // await sendPaymentConfirmation(data.order_id);
  
  logger.info('Payment success processing completed', {
    orderId: data.order_id,
    nextSteps: ['database_update', 'email_notification', 'fulfillment_trigger']
  });
}

async function handleFailedPayment(data: WebXPayWebhookData) {
  logger.paymentFailure(
    data.order_id,
    data.status_code,
    data.transaction_amount,
    `Status code: ${data.status_code}`
  );
  
  // Log detailed failure information
  logger.audit('Payment failure details', {
    orderId: data.order_id,
    referenceNumber: data.order_refference_number,
    statusCode: data.status_code,
    transactionAmount: data.transaction_amount,
    requestedAmount: data.requested_amount,
    hasSignature: !!data.signature,
    additionalFeeMessage: data.additional_fee_discount_message
  });
  
  // Here you would typically:
  // 1. Update your database with the failed payment
  // 2. Send failure notifications
  // 3. Log the failure reason
  
  // Example database update (pseudo-code):
  // await updatePaymentStatus(data.order_id, 'failed', null);
  // await sendPaymentFailureNotification(data.order_id);
  
  logger.info('Payment failure processing completed', {
    orderId: data.order_id,
    nextSteps: ['database_update', 'failure_notification', 'retry_logic']
  });
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  logger.info('Webhook verification request', {
    hasChallenge: !!challenge,
    challengeLength: challenge?.length || 0,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
  
  if (challenge) {
    // WebX Pay webhook verification
    logger.audit('Webhook challenge verification', {
      challengeLength: challenge.length,
      response: 'challenge_accepted'
    });
    
    return NextResponse.json({ challenge });
  }
  
  logger.debug('Webhook endpoint health check');
  
  return NextResponse.json({ 
    message: 'WebX Pay webhook endpoint',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0'
  });
}
