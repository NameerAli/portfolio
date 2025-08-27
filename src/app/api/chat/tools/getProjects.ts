import { tool } from "ai";
import { z } from "zod";

export const getProjects = tool({
  description: "This tool will show a list of all projects made by Nameer",
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: "Here are all the projects made by Nameer (above)! Don't hesitate to ask me more about them! 🚀",
      },
    ];
  },
});
