import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, UIMessage, SystemModelMessage } from 'ai'; // Add SystemModelMessage import
import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getCrazy } from './tools/getCrazy';
import { getInternship } from './tools/getInternship';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSports';

export const maxDuration = 30;

function errorHandler(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown non-serializable error";
  }
}

// Define all tools in a single object
const tools = {
  getProjects,
  getPresentation,
  getResume,
  getContact,
  getSkills,
  getSports,
  getCrazy,
  getInternship,
};

//Model selection
const model = groq('openai/gpt-oss-20b');

// Correct validation for AI SDK tools
const validateTools = () => {
  const toolNames = Object.keys(tools);
  console.log('Available tools:', toolNames);
  
  for (const [name, tool] of Object.entries(tools)) {
    // Check if tool is an object (not null)
    if (!tool || typeof tool !== 'object') {
      throw new Error(`Tool ${name} is not properly defined - must be an object`);
    }
    
    // Check if tool has execute function (AI SDK tools)
    if (typeof tool.execute !== 'function') {
      throw new Error(`Tool ${name} is missing execute function`);
    }
    
    // Check if tool has inputSchema (required for AI SDK tools)
    if (!tool.inputSchema) {
      throw new Error(`Tool ${name} is missing inputSchema`);
    }
  }
};


export async function POST(req: Request) {
  try {
    validateTools();
    let body: { messages?: UIMessage[] };
    
    try {
      body = await req.json();
    } catch (jsonErr) {
      console.error('Failed to parse JSON body:', jsonErr);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error('Invalid or missing "messages" field in request body:', body);
      return new Response(JSON.stringify({ error: 'Missing or invalid "messages" field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(body.messages);
    
    // Add system prompt if not already present
    const hasSystemMessage = modelMessages.some(msg => msg.role === 'system');
    if (!hasSystemMessage && SYSTEM_PROMPT) {
      // ✅ Use explicit type annotation
      const systemMessage: SystemModelMessage = {
        role: 'system',
        content: typeof SYSTEM_PROMPT === 'string' ? SYSTEM_PROMPT : SYSTEM_PROMPT.content
      };
      modelMessages.unshift(systemMessage);
    }

    const result = streamText({
      model,
      messages: modelMessages,
      tools,
      // Add error handling
      onError: ({ error }) => {
        console.error('StreamText error:', error);
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (err) {
    console.error('Unexpected global error in POST handler:', err);
    const errorMessage = errorHandler(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
