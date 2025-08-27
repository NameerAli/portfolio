import { tool } from 'ai';
import { z } from 'zod';

export const getSkills = tool({
  description: "Use this tool whenever the user asks about Nameer Ali’s technical expertise, programming languages, frameworks, or professional skill set.",
  inputSchema: z.object({}),
  execute: async () => {
    const skills = [
      "Python",
      "TypeScript",
      "FastAPI",
      "Django",
      "Next.js",
      "LangChain",
      "RAG pipelines",
      "LLM Agent development",
      "AI integration",
      "Web Development",
      "API Development",
      "Machine Learning",
      "Data Analysis",
    ];
    return [{ type: "text", text: `Here are my main skills:\n- ${skills.join("\n- ")}` }];
  },
});

