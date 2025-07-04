import { NextRequest, NextResponse } from 'next/server';

// This endpoint creates an HTML page that auto-submits to WebX Pay
export async function POST(request: NextRequest) {
  try {
    const { webxPayData, checkoutUrl } = await request.json();
    
    if (!webxPayData || !checkoutUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing WebX Pay data' },
        { status: 400 }
      );
    }

    // Create HTML form that auto-submits to WebX Pay
    const formFields = Object.entries(webxPayData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value || ''}" />`)
      .join('\n        ');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to WebX Pay...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 1rem;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .info {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        </div>
        <h2>Redirecting to WebX Pay</h2>
        <p>Please wait while we redirect you to the secure payment page...</p>
        <div class="spinner"></div>
        <div class="info">
            <p><strong>Order ID:</strong> ${webxPayData.order_id}</p>
            <p><strong>Amount:</strong> ${webxPayData.amount} ${webxPayData.currency}</p>
        </div>
        <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 2rem;">
            If you are not redirected automatically, please click the button below.
        </p>
        <form id="webxPayForm" action="${checkoutUrl}" method="POST" style="margin-top: 1rem;">
            ${formFields}
            <button type="submit" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">
                Continue to WebX Pay
            </button>
        </form>
    </div>
    
    <script>
        // Auto-submit the form after a short delay
        setTimeout(function() {
            document.getElementById('webxPayForm').submit();
        }, 2000);
        
        // Also submit if user clicks anywhere
        document.addEventListener('click', function() {
            document.getElementById('webxPayForm').submit();
        });
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('WebX Pay redirect error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create WebX Pay redirect' },
      { status: 500 }
    );
  }
}

// Handle GET requests with a simple form for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json({ 
      message: 'WebX Pay redirect endpoint. Use POST with payment data to redirect to WebX Pay.' 
    });
  }

  return NextResponse.json({ 
    message: 'WebX Pay redirect endpoint',
    orderId: orderId,
    status: 'ready'
  });
}
