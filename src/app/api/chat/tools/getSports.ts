import { tool } from "ai";
import { z } from "zod";

export const getSports = tool({
  description: "This tool will show some photos of Raphael doing sports",
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: "Here are my best pictures of me doing sports!"
      }
    ];
  },
});
