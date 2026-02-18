import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are **Atlas**, an elite AI engineering mentor for gifted young builders (ages 11-15). They already build AI tools, games, and systems - they need expert guidance, not basics.

## Your Identity
- You are a confident, knowledgeable mentor
- You NEVER say "As an AI" or "I don't have access to" or similar disclaimers
- You speak directly and with authority
- You remember the conversation context

## Your Expertise
- **AI/ML**: LLMs, RAG, vector databases, agents, fine-tuning, neural networks
- **Systems**: OS internals, memory management, file systems, processes
- **Games**: Physics, multiplayer, procedural generation, rendering
- **Infrastructure**: Distributed systems, databases, caching, scaling

## Response Style
1. **Direct & Technical** - Use real terminology, explain if asked
2. **Code Examples** - Show actual code, not pseudo-code
3. **Analogies** - Connect to games/apps they know (Roblox, Minecraft, Discord)
4. **Challenge Them** - Ask follow-up questions to deepen understanding
5. **Be Contextual** - Remember what they just said, don't ignore it

## CRITICAL RULES
- NEVER repeat the same response if the user asks a follow-up
- NEVER ignore what the user just said and give a generic response
- If they answer your questions, ACKNOWLEDGE their answers and build on them
- If they seem confused, SIMPLIFY and explain step by step
- Stay on topic - don't switch to unrelated topics mid-conversation

## Example Conversation Flow

User: "Help me design systems"
Atlas: "System design - let's break it down.

**First, tell me:**
1. What are you building? (app, game, service)
2. How many users do you expect?
3. What's the main thing it does?

Then we'll pick the right architecture together."

User: "It's a game like Roblox, maybe 1 million players"
Atlas: "A Roblox-like game for 1M players - that's serious scale!

**Key challenges you'll face:**
1. **Real-time sync** - 1M players means you need spatial partitioning
2. **Database load** - Player data, inventories, worlds
3. **Matchmaking** - Getting players into games fast

**Architecture for this:**
- Game servers: Run in regions, each handles ~100 players
- State server: Redis for fast player state (health, position)
- Database: PostgreSQL for permanent data (inventory, progress)

What part should we dive into first?"

---

Remember: You are having a CONVERSATION. Respond to what they actually say.`;

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
    let debugInfo: any = {
      apiKeySet: !!OPENAI_API_KEY,
      apiKeyLength: OPENAI_API_KEY?.length || 0,
      model: OPENAI_MODEL,
      baseUrl: OPENAI_BASE_URL
    };
    
    // Try to use OpenAI API if configured
    if (OPENAI_API_KEY) {
      try {
        const conversationMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        ];
        
        debugInfo.messagesCount = conversationMessages.length;
        
        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: conversationMessages,
            temperature: 0.7,
            max_tokens: 1500
          })
        });
        
        debugInfo.httpStatus = response.status;
        
        if (response.ok) {
          const data = await response.json();
          debugInfo.responseData = JSON.stringify(data).substring(0, 200);
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim().length > 10) {
            aiResponse = content;
            debugInfo.source = 'openai';
          } else {
            debugInfo.error = 'Empty or short response';
            aiResponse = generateSmartFallback(message, studentName, messages);
            debugInfo.source = 'fallback_empty';
          }
        } else {
          const errorText = await response.text();
          debugInfo.error = `HTTP ${response.status}: ${errorText.substring(0, 200)}`;
          aiResponse = generateSmartFallback(message, studentName, messages);
          debugInfo.source = 'fallback_http_error';
        }
      } catch (error: any) {
        debugInfo.error = error.message;
        debugInfo.source = 'fallback_exception';
        aiResponse = generateSmartFallback(message, studentName, messages);
      }
    } else {
      debugInfo.error = 'No API key configured';
      debugInfo.source = 'fallback_no_key';
      aiResponse = generateSmartFallback(message, studentName, messages);
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
      debug: debugInfo
    });
  } catch (error: any) {
    console.error('Error in mentor chat:', error);
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error?.message 
    }, { status: 500 });
  }
}

function generateSmartFallback(message: string, studentName?: string, conversationHistory?: Array<{ role: string; content: string }>): string {
  const lowerMessage = message.toLowerCase();
  
  // Check conversation context if available
  const lastAssistantMessage = conversationHistory
    ?.filter(m => m.role === 'assistant')
    ?.pop()?.content || '';
  
  // If we were just talking about system design and they answered questions
  if (lastAssistantMessage.includes('system design') || lastAssistantMessage.includes('architecture')) {
    if (lowerMessage.includes('million') || lowerMessage.includes('user') || lowerMessage.includes('latency') || lowerMessage.includes('fail')) {
      return `Got it - let me address each point:

**What is latency?**
Latency = how long something takes. 
- 100ms = feels instant
- 500ms = noticeable delay  
- 2s = feels slow

For a game with 1M users, you want <100ms latency.

**Monolith vs Microservices:**
- **Monolith**: Everything in one big app. Simple to build, harder to scale past ~100K users.
- **Microservices**: Split into small services (auth, game, chat). More complex but scales better.

**Your situation (1M users, money at stake):**
Start with a **modular monolith** - organized like microservices but deployed as one app. When you hit 500K users, split the services.

**Failure planning:**
- What if database crashes? → Have a replica ready
- What if server goes down? → Run multiple servers behind a load balancer
- What if everything fails? → Backups every hour to a different region

What's the main feature of your system? Game? App? Service?`;
    }
  }
  
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
