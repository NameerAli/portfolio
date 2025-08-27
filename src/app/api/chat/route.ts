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

const model = groq('qwen/qwen3-32b');

export async function POST(req: Request) {
  try {
    let body: { messages?: UIMessage[] };
    
    try {
      body = await req.json();
      console.log('Incoming request body messages:', body.messages);
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
    console.log('Model messages after conversion and system prompt addition:', modelMessages);
    
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
    });
    console.log('Received streamText result:', result);
    return result.toUIMessageStream();

  } catch (err) {
    console.error('Unexpected global error in POST handler:', err);
    const errorMessage = errorHandler(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
