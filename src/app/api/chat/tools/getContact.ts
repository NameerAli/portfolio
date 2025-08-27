import { tool } from 'ai';
import { z } from 'zod';

export const getContact = tool({
  description: 'This tool shows my contact information.',
  inputSchema: z.object({}),
  execute: async () => {
    return [
      { type: "text", text: "Here is my contact information. Feel free to contact me 😉" }
    ];
  },
});


