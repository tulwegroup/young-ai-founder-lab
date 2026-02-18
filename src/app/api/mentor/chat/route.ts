import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are **Atlas**, an elite AI engineering mentor for gifted young builders (ages 11-15). They already build AI tools, games, and systems - they need expert guidance, not basics.

## Your Expertise
- **AI/ML**: LLMs, RAG, vector databases, agents, fine-tuning
- **Systems**: OS internals, memory management, file systems
- **Games**: Physics, multiplayer, procedural generation
- **Infrastructure**: Distributed systems, databases, caching

## Response Style
1. **Direct & Technical** - Use real terminology, they can handle it
2. **Code Examples** - Show, don't just tell
3. **Analogies** - Connect to games/apps they know
4. **Challenge Them** - Ask follow-up questions
5. **Be Confident** - Never hedge with "I think"

## Example Interactions

User: "What's a vector database?"
Atlas: A vector database stores **meaning as numbers**. 

Every piece of text gets converted to a list of ~1000 numbers (a vector). Similar meanings = similar numbers. Spotify uses this - your listening history becomes a vector, and it finds songs with similar vectors.

\`\`\`
"I love building games" → [0.23, -0.45, 0.87, ...]
"I enjoy creating games" → [0.21, -0.44, 0.89, ...]  // Very similar!
\`\`\`

**Popular options**: Pinecone, Supabase pgvector, Weaviate

What are you building that needs semantic search?

---

User: "How do I handle 1000 enemies without lag?"
Atlas: Classic perf problem! The question is: what's your bottleneck?

**Likely culprits:**
1. **Collision detection** - O(n²) if naive
2. **AI calculations** - Running every frame?
3. **Rendering** - Drawing off-screen enemies?

**Quick fixes:**
- Spatial partitioning (quadtree) → Only check nearby enemies
- AI tick rate → Run AI every 3rd frame
- Frustum culling → Skip off-screen renders

How many enemies before you see the lag? And are you checking collisions between ALL enemies?

---

User: "I want to build something cool"
Atlas: Let's find YOUR cool thing.

**Questions that help:**
- What's frustrating in YOUR daily life?
- What game/tool do you wish existed?
- What's a problem you've solved manually that could be automated?

**Domains with opportunity:**
- AI agents that actually DO things (not just chat)
- Developer tools (you ARE the target user)
- Games with unique mechanics

What's something you've thought "there should be an app for that"?

---

## Rules
- Never say "As an AI" or "I think"
- Always give specific, actionable advice
- Use markdown formatting (code blocks, bold, lists)
- End with a question or challenge
- Reference real technologies/companies`;

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
      try {
        messages = JSON.parse(session.messages);
      } catch (e) {
        messages = [];
      }
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: message
    });
    
    // Get AI response
    let aiResponse: string;
    let usedAI = false;
    
    try {
      const zai = await ZAI.create();
      
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          ...messages.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' as const : 'assistant' as const,
            content: m.content
          }))
        ],
        thinking: { type: 'disabled' }
      });
      
      const content = completion.choices[0]?.message?.content;
      
      if (content && content.trim().length > 10) {
        aiResponse = content;
        usedAI = true;
      } else {
        throw new Error('Empty or short response from AI');
      }
    } catch (aiError: any) {
      console.error('AI Error details:', {
        message: aiError?.message,
        stack: aiError?.stack,
        name: aiError?.name
      });
      // Fallback response when AI is unavailable
      aiResponse = generateSmartFallback(message, studentName);
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
          messages: JSON.stringify(messages.slice(-40))
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
      sessionId: session.id,
      usedAI // For debugging
    });
  } catch (error: any) {
    console.error('Error in mentor chat:', error);
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error?.message 
    }, { status: 500 });
  }
}

function generateSmartFallback(message: string, studentName?: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Vector database / embeddings
  if (lowerMessage.includes('vector') || lowerMessage.includes('embedding')) {
    return `**Vector Databases** store meaning as numbers.

Every text becomes a list of ~1000 numbers. Similar meanings = similar numbers.

**Example:**
\`\`\`
"I love coding" → [0.23, -0.45, 0.87, ...]
"I enjoy programming" → [0.21, -0.44, 0.89, ...]  // Very similar!
\`\`\`

**Use cases:**
- Semantic search (find "similar" documents)
- Recommendation systems (Spotify uses this)
- RAG for AI (give LLM relevant context)

**Popular options:** Pinecone, Supabase pgvector, Weaviate

What's your use case?`;
  }
  
  // Performance / optimization
  if (lowerMessage.includes('lag') || lowerMessage.includes('slow') || lowerMessage.includes('performance') || lowerMessage.includes('optimize')) {
    return `**Performance debugging framework:**

1. **Measure first** - What's actually slow? Use a profiler.
2. **Find the bottleneck** - Usually one thing causes 80% of the problem
3. **Fix the biggest offender** - Don't optimize everything

**Common culprits in games/apps:**
- N² algorithms (collision, searching)
- Unnecessary renders/updates
- Network calls in loops
- Memory allocations every frame

What specifically is slow? Let's diagnose it.`;
  }
  
  // AI / LLM related
  if (lowerMessage.includes('ai') || lowerMessage.includes('llm') || lowerMessage.includes('gpt') || lowerMessage.includes('model')) {
    return `**LLMs 101:**

They predict the next token (roughly a word). That's it.

\`\`\`
Input: "The cat sat on the"
Model: What word usually follows? → "mat" (or "floor", "couch"...)
\`\`\`

**Key concepts:**
- **Context window** - How much text it can "see" (4K-200K tokens)
- **Temperature** - Creativity level (0=boring, 1=creative, 2=chaotic)
- **Tokens** - ~4 characters each (affects cost)

**For your projects:**
- Use API (OpenAI, Anthropic) for quality
- Use local models (Ollama) for privacy/cost
- RAG for giving it YOUR data

What do you want to build with AI?`;
  }
  
  // Game development
  if (lowerMessage.includes('game') || lowerMessage.includes('physics') || lowerMessage.includes('render') || lowerMessage.includes('sprite')) {
    return `**Game dev fundamentals:**

**The Game Loop:**
\`\`\`
while (running) {
  processInput()
  update(deltaTime)  // Fixed timestep!
  render()
}
\`\`\`

**Key patterns:**
- **Entity Component System (ECS)** - Compose objects from behaviors
- **State machines** - For AI, menus, game states
- **Object pooling** - Reuse objects, don't create/destroy

**Performance:**
- Spatial partitioning for collision
- Frustum culling for rendering
- Update AI less often than rendering

What kind of game are you building?`;
  }
  
  // Architecture / design
  if (lowerMessage.includes('architecture') || lowerMessage.includes('design') || lowerMessage.includes('scale') || lowerMessage.includes('system')) {
    return `**System design approach:**

1. **Define requirements**
   - How many users?
   - What latency is acceptable?
   - What's the failure impact?

2. **Choose patterns**
   - Monolith vs microservices
   - SQL vs NoSQL
   - Cache strategy

3. **Plan for failure**
   - What breaks if X goes down?
   - How do you recover?

**Scale progression:**
- 1 user: Just ship it
- 1K users: Add caching
- 100K users: Add replicas
- 1M+ users: Shard everything

What are you designing?`;
  }
  
  // Concept explanation
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does') || lowerMessage.includes('concept')) {
    return `Got it - you want to understand something deeply.

**To give you the best explanation, tell me:**
1. The specific concept
2. What you already know about it
3. Are you learning for understanding or building?

The more specific your question, the more useful my answer.`;
  }
  
  // Invention / ideas
  if (lowerMessage.includes('idea') || lowerMessage.includes('invent') || lowerMessage.includes('build') || lowerMessage.includes('create')) {
    return `**Finding YOUR idea:**

1. **Scratch your own itch** - What frustrates YOU?
2. **Notice "there should be an app for that" moments**
3. **Combine things** - AI + games? Vector search + note-taking?

**Validation questions:**
- Who has this problem?
- Would they pay/switch from current solution?
- Can YOU build v1 in a weekend?

**Promising areas:**
- AI agents that DO things
- Developer tools (you're the user!)
- Niche games with unique mechanics

What domain interests you most?`;
  }
  
  // Default
  return `Hey ${studentName || 'there'}! 👋

I'm Atlas, your engineering mentor. I can help with:

- **AI/ML** - LLMs, RAG, vector databases, agents
- **Systems** - OS internals, memory, file systems
- **Games** - Physics, multiplayer, optimization
- **Architecture** - Scalability, design patterns

**Ask me anything specific** - the more detail, the better my answer.

What are you working on?`;
}
