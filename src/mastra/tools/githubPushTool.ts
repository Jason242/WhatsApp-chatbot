import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Placeholder GitHub push tool - not used in current implementation
export const githubPushBotCodeTool = createTool({
  id: "github-push-bot-code",
  description: "Push bot code to GitHub repository",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async () => {
    return {
      success: false,
      message: "GitHub push tool not implemented",
    };
  },
});
