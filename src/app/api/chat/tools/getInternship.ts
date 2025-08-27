import { tool } from 'ai';
import { z } from 'zod';

export const getInternship = tool({
  description:
    "Gives a summary of what kind of internship I'm looking for, plus my contact info and how to reach me. Use this tool when the user asks about my internship search or how to contact me for opportunities.",
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: `Here’s what I’m looking for 👇\n
- 📅 **Duration**: 6-month internship starting **September 2025**
- 🌍 **Location**: Preferably **San Francisco** or anywhere in the **United States**
- 🧑‍💻 **Focus**: AI development, full-stack web apps, SaaS, agentic workflows
- 🛠️ **Stack**: Python, React/Next.js, Tailwind CSS, TypeScript, GPT, RAG, etc.
- 💼 **Visa**: I’m based in Paris 🇫🇷 so I might need **J-1 sponsorship**
- ✅ **What I bring**: Real experience with secure on-prem GPTs (Lighton), deepsearch engines, custom RAG tools, and hackathon wins like **ETH Oxford** & **Paris Blockchain Week**
- 🔥 I move fast, learn faster, and I’m HUNGRYYYYY for big challenges`
      },
      {
        type: "text",
        text: `📬 **Contact me** via:
- Email: s.nameer18606@gmail.com
- LinkedIn: https://www.linkedin.com/in/syednameerali/
- GitHub: https://github.com/nameerali

Let's build cool shit together ✌️`
      }
    ];
  },
});
