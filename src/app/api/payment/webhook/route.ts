import { NextRequest, NextResponse } from 'next/server';

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
  try {
    let webhookData: WebXPayWebhookData;
    
    // Get the raw body first to log it
    const rawBody = await request.text();
    console.log('Raw webhook body:', rawBody);
    
    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Parse as JSON
      webhookData = JSON.parse(rawBody);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse as form data
      const formData = new URLSearchParams(rawBody);
      webhookData = {} as WebXPayWebhookData;
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
    } else {
      // Try to parse as form data by default (most common for webhooks)
      const formData = new URLSearchParams(rawBody);
      webhookData = {} as WebXPayWebhookData;
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
    }
    
    console.log('Parsed webhook data:', webhookData);
    console.log('Content-Type:', contentType);
    
    // Basic validation
    if (!webhookData.order_id || !webhookData.status_code) {
      console.error('Invalid webhook data: missing required fields');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Decode custom fields (base64 encoded)
    const decodedCustomFields: Record<string, string> = {};
    try {
      const customFieldsDecoded = Buffer.from(webhookData.custom_fields, 'base64').toString('utf-8');
      console.log('Decoded custom fields:', customFieldsDecoded);
      
      // Parse custom fields (format: name:John Doe|email:test@test.com|phone:123|address:123 Street)
      const customFieldPairs = customFieldsDecoded.split('|');
      customFieldPairs.forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value) {
          decodedCustomFields[key] = value;
        }
      });
    } catch (error) {
      console.error('Error decoding custom fields:', error);
    }

    // Decode payment data (base64 encoded)
    const decodedPaymentData: Record<string, string> = {};
    try {
      const paymentDecoded = Buffer.from(webhookData.payment, 'base64').toString('utf-8');
      console.log('Decoded payment data:', paymentDecoded);
      
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
      }
    } catch (error) {
      console.error('Error decoding payment data:', error);
    }

    // Log the complete webhook data
    console.log('Complete webhook processing:', {
      orderId: webhookData.order_id,
      referenceNumber: webhookData.order_refference_number,
      statusCode: webhookData.status_code,
      transactionAmount: webhookData.transaction_amount,
      requestedAmount: webhookData.requested_amount,
      customFields: decodedCustomFields,
      paymentData: decodedPaymentData
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
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      order_id: webhookData.order_id,
      status_code: webhookData.status_code,
      reference_number: webhookData.order_refference_number
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Webhook processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: WebXPayWebhookData) {
  console.log('Payment successful:', {
    orderId: data.order_id,
    referenceNumber: data.order_refference_number,
    transactionAmount: data.transaction_amount,
    requestedAmount: data.requested_amount,
    statusCode: data.status_code
  });
  
  // Here you would typically:
  // 1. Update your database with the successful payment
  // 2. Send confirmation emails
  // 3. Update order status
  // 4. Trigger fulfillment processes
  
  // Example database update (pseudo-code):
  // await updatePaymentStatus(data.order_id, 'completed', data.order_refference_number);
  // await sendPaymentConfirmation(data.order_id);
}

async function handleFailedPayment(data: WebXPayWebhookData) {
  console.log('Payment failed:', {
    orderId: data.order_id,
    statusCode: data.status_code,
    transactionAmount: data.transaction_amount,
    requestedAmount: data.requested_amount,
    referenceNumber: data.order_refference_number
  });
  
  // Here you would typically:
  // 1. Update your database with the failed payment
  // 2. Send failure notifications
  // 3. Log the failure reason
  
  // Example database update (pseudo-code):
  // await updatePaymentStatus(data.order_id, 'failed', null);
  // await sendPaymentFailureNotification(data.order_id);
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // WebX Pay webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ 
    message: 'WebX Pay webhook endpoint',
    timestamp: new Date().toISOString()
  });
}
