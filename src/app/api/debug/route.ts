import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('=== DEBUG: Payment form data received ===');
    console.log(JSON.stringify(formData, null, 2));
    
    // Simple response for debugging
    const response = {
      success: true,
      debug: true,
      received: formData,
      message: 'Debug mode - data received successfully'
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug failed', message: String(error) },
      { status: 500 }
    );
  }
}
