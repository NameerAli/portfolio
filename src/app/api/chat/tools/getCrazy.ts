import { tool } from "ai";
import { z } from "zod";

export const getCrazy = tool({
  description:
    "This tool will return the craziest thing I've ever done. Use it when the user asks something like: 'What’s the craziest thing you've ever done?'",
  inputSchema: z.object({}),
  execute: async () => {
    return [
      {
        type: "text",
        text: "Above is a photo of me on top of Mont Blanc, the highest mountain in the Alps and Europe. I climbed it with a friend, without a guide — an unforgettable adventure! 🌍⛰️",
      },
      {
        type: "text",
        text: "Winds were hitting 80km/h when we reached the summit! 💨",
      },
      {
        type: "text",
        text: "I also made a YouTube video of this adventure: https://www.youtube.com/watch?v=rufGMSgzUOk&ab_channel=Toukoum",
      },
    ];
  },
});
