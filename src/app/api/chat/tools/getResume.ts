import { tool } from 'ai';
import { z } from 'zod';

export const getResume = tool({
  description: 'This tool shows my resume.',
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: "You can download my resume by clicking on the link above."
      }
    ];
  },
});
