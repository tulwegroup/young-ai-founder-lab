import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET() {
  try {
    console.log('Testing ZAI SDK...');
    
    const zai = await ZAI.create();
    console.log('ZAI instance created');
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a helpful assistant. Respond briefly.' },
        { role: 'user', content: 'Say "Hello, I am working!" in exactly those words.' }
      ],
      thinking: { type: 'disabled' }
    });
    
    console.log('Completion received:', completion);
    
    const response = completion.choices[0]?.message?.content;
    
    return NextResponse.json({
      success: true,
      response: response,
      hasChoices: completion.choices?.length > 0
    });
  } catch (error: any) {
    console.error('ZAI Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message,
      name: error?.name
    }, { status: 500 });
  }
}
