import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Nameer Ali. It is used to answer the question "Who are you?" or "Tell me about yourself"',
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: "I'm Nameer, a 25-year-old developer specializing in AI at Karachi. Formerly a high-level mountain biker, I now intern at LightOn AI in Paris. I'm passionate about AI, tech, entrepreneurship, and SaaS innovation 🚀."
      }
    ];
  },
});
