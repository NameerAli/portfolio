import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getCrazy } from './tools/getCrazy';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSport';

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

function isValidMessage(message: any): message is { role: string; content: string } {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.role === 'string' &&
    typeof message.content === 'string'
  );
}

export async function POST(req: Request) {
  try {
    let body: any;
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

    const sanitizedMessages = body.messages.filter(isValidMessage);

    if (sanitizedMessages.length === 0) {
      console.error('No valid messages found after sanitization:', body.messages);
      return new Response(JSON.stringify({ error: 'No valid messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert system prompt at the start
    sanitizedMessages.unshift(SYSTEM_PROMPT);

    const result = streamText({
    model,
    messages: sanitizedMessages,
    tools,
    });


    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });

  } catch (err) {
    console.error('Unexpected global error in POST handler:', err);
    const errorMessage = errorHandler(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } 
}
