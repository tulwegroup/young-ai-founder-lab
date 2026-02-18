import { NextResponse } from 'next/server';

export async function GET() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  // Check if API key exists (show first/last 4 chars for debugging)
  const keyPreview = OPENAI_API_KEY 
    ? `${OPENAI_API_KEY.substring(0, 7)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`
    : 'NOT SET';
  
  const keyLength = OPENAI_API_KEY ? OPENAI_API_KEY.length : 0;
  
  // Try a simple API call
  let apiTestResult = 'Not tested';
  let apiTestError = null;
  
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'user', content: 'Say "Hello, I am working!" in exactly those words.' }
          ],
          max_tokens: 20
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        apiTestResult = `SUCCESS: ${JSON.stringify(data.choices?.[0]?.message?.content)}`;
      } else {
        const errorText = await response.text();
        apiTestError = `HTTP ${response.status}: ${errorText}`;
        apiTestResult = 'FAILED';
      }
    } catch (error: any) {
      apiTestError = error.message;
      apiTestResult = 'ERROR';
    }
  }
  
  return NextResponse.json({
    environment: {
      OPENAI_API_KEY_SET: !!OPENAI_API_KEY,
      OPENAI_API_KEY_PREVIEW: keyPreview,
      OPENAI_API_KEY_LENGTH: keyLength,
      OPENAI_BASE_URL,
      OPENAI_MODEL
    },
    apiTest: {
      result: apiTestResult,
      error: apiTestError
    },
    timestamp: new Date().toISOString()
  });
}
