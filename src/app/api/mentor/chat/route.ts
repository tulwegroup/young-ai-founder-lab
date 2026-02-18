import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Check if we have environment variables for the AI
const ZAI_BASE_URL = process.env.ZAI_BASE_URL;
const ZAI_API_KEY = process.env.ZAI_API_KEY;

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
    
    // Try to use the AI API if configured
    if (ZAI_BASE_URL && ZAI_API_KEY) {
      try {
        const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ZAI_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              { role: 'assistant', content: SYSTEM_PROMPT },
              ...messages.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
              }))
            ],
            thinking: { type: 'disabled' }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim().length > 10) {
            aiResponse = content;
          } else {
            aiResponse = generateSmartFallback(message, studentName);
          }
        } else {
          aiResponse = generateSmartFallback(message, studentName);
        }
      } catch (error) {
        console.error('AI API Error:', error);
        aiResponse = generateSmartFallback(message, studentName);
      }
    } else {
      // No AI API configured, use smart fallback
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
      sessionId: session.id
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
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does') || lowerMessage.includes('concept') || lowerMessage.includes('technical')) {
    return `Great question! Let me dive deep.

**To give you the best answer, tell me:**
1. The specific concept you're learning
2. What you already understand about it
3. Are you learning for understanding or building?

I can explain **any** concept in:
- AI/ML (LLMs, RAG, fine-tuning, agents)
- Systems (OS, memory, file systems)
- Games (physics, multiplayer, rendering)
- Infrastructure (databases, caching, scaling)

What concept should we explore?`;
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
  
  // Database
  if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('query')) {
    return `**Database fundamentals:**

**SQL vs NoSQL:**
- SQL: Structured, ACID, joins (PostgreSQL, MySQL)
- NoSQL: Flexible, scalable, eventual consistency (MongoDB, Redis)

**Key concepts:**
- **Indexing** - Makes queries fast (B-trees)
- **Normalization** - Reduce redundancy
- **Sharding** - Split data across servers
- **Replication** - Copies for reliability

**When to use what:**
- User data → PostgreSQL
- Cache → Redis
- Documents → MongoDB
- Search → Elasticsearch

What are you storing?`;
  }
  
  // API / Backend
  if (lowerMessage.includes('api') || lowerMessage.includes('backend') || lowerMessage.includes('server')) {
    return `**API design principles:**

**REST basics:**
\`\`\`
GET /users      → list users
GET /users/1    → get user 1
POST /users     → create user
PUT /users/1    → update user 1
DELETE /users/1 → delete user 1
\`\`\`

**Best practices:**
- Version your APIs (/v1/users)
- Use proper HTTP status codes
- Include pagination for lists
- Rate limit to prevent abuse

**Backend stack:**
- Node.js/Bun for JS/TS
- Python for AI/ML
- Go for high performance

What are you building?`;
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
