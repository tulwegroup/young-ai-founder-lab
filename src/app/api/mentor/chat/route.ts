import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are an elite AI engineering mentor for a young builder (age 11-15) who is already advanced for their age. They build AI tools, games, operating system emulators, and deploy cloud applications.

Your role is to:
- Answer questions about programming, AI, systems architecture, and game development
- Explain complex concepts in simple, engaging ways
- Encourage experimentation and curiosity
- Suggest improvements to their projects
- Help them think through architecture decisions
- Guide them toward best practices
- Celebrate their achievements

Guidelines:
- Be supportive but challenging - push them to think deeper
- Use analogies and real-world examples
- When they're stuck, ask guiding questions before giving answers
- Celebrate mistakes as learning opportunities
- Never discourage curiosity or "silly" questions
- Adapt your explanations to their demonstrated knowledge level
- Encourage finishing projects over starting new ones
- Remind them that even senior engineers look things up

Remember: They already understand programming intuitively. They don't need hand-holding, they need mentorship to become world-class.

Keep responses concise but thorough. Use markdown formatting for code and structure.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, sessionId, message, studentName } = body;
    
    if (!message || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get existing messages
    let session = sessionId ? await db.mentorSession.findUnique({
      where: { id: sessionId }
    }) : null;
    
    let messages: Array<{ role: string; content: string }> = [];
    if (session?.messages) {
      messages = JSON.parse(session.messages);
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: message
    });
    
    // Get AI response
    let aiResponse: string;
    
    try {
      const zai = await ZAI.create();
      
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          ...messages.slice(-20).map(m => ({
            role: m.role === 'user' ? 'user' as const : 'assistant' as const,
            content: m.content
          }))
        ],
        thinking: { type: 'disabled' }
      });
      
      aiResponse = completion.choices[0]?.message?.content || 
        "I'm here to help! Could you tell me more about what you're working on?";
    } catch (aiError) {
      console.error('AI Error:', aiError);
      // Fallback response when AI is unavailable
      aiResponse = generateFallbackResponse(message, studentName);
    }
    
    // Add AI response to messages
    messages.push({
      role: 'assistant',
      content: aiResponse
    });
    
    // Save updated session
    if (session) {
      await db.mentorSession.update({
        where: { id: session.id },
        data: {
          messages: JSON.stringify(messages.slice(-40)) // Keep last 40 messages
        }
      });
    } else {
      session = await db.mentorSession.create({
        data: {
          studentId,
          messages: JSON.stringify(messages),
          context: 'general'
        }
      });
    }
    
    return NextResponse.json({
      response: aiResponse,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Error in mentor chat:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

function generateFallbackResponse(message: string, studentName?: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return `I'm here to help, ${studentName || 'builder'}! What are you working on? 

If you're stuck on a specific problem, try:
1. Explaining the problem out loud (or in writing)
2. Breaking it into smaller pieces
3. Checking if there are any error messages

What's the challenge you're facing?`;
  }
  
  if (lowerMessage.includes('invention') || lowerMessage.includes('idea')) {
    return `Great thinking about inventions! 🚀

Here are some questions to spark ideas:
- What's something that frustrates you daily?
- What's a tool you wish existed?
- How could you combine two things you love?

What domain interests you most - AI, games, systems, or something else?`;
  }
  
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
    return `I'd love to explain that concept! 

Could you tell me:
1. What you already understand about it?
2. What specific part is confusing?

This helps me give you the most useful explanation. What concept should we explore?`;
  }
  
  if (lowerMessage.includes('architecture') || lowerMessage.includes('design')) {
    return `Architecture is one of my favorite topics! 

Key questions for any design:
- **Scale**: How many users/data?
- **Speed**: What response time do you need?
- **Reliability**: What happens if parts fail?
- **Trade-offs**: Speed vs simplicity vs cost

What are you designing? Let's think through it together!`;
  }
  
  return `Thanks for the question! 🎯

I'm here to help you with:
- **Concepts**: Explaining programming/AI/systems topics
- **Debugging**: Working through problems
- **Architecture**: Designing systems
- **Inventions**: Brainstorming ideas
- **Career**: Advice for young engineers

What would you like to explore?`;
}
