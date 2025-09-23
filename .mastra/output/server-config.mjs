import { MastraError } from '@mastra/core/error';
import { Inngest, NonRetriableError } from 'inngest';
import { z } from 'zod';
import { serve } from 'inngest/hono';

const inngest = new Inngest({
  id: "moki-whatsapp-bot",
  name: "MOKI WhatsApp Bot"
});
const inngestServe = serve({
  client: inngest
  // This will be configured when called from the API route
});

const server = {
  host: "0.0.0.0",
  port: 5e3,
  middleware: [async (c, next) => {
    const mastra2 = c.get("mastra");
    const logger = mastra2?.getLogger();
    logger?.debug("[Request]", {
      method: c.req.method,
      url: c.req.url
    });
    try {
      await next();
    } catch (error) {
      logger?.error("[Response]", {
        method: c.req.method,
        url: c.req.url,
        error
      });
      if (error instanceof MastraError) {
        if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
          throw new NonRetriableError(error.message, {
            cause: error
          });
        }
      } else if (error instanceof z.ZodError) {
        throw new NonRetriableError(error.message, {
          cause: error
        });
      }
      throw error;
    }
  }],
  apiRoutes: [
    // This API route is used to register the Mastra workflow (inngest function) on the inngest server
    {
      path: "/api/inngest",
      method: "ALL",
      createHandler: async ({
        mastra: mastra2
      }) => inngestServe({
        mastra: mastra2,
        inngest
      })
      // The inngestServe function integrates Mastra workflows with Inngest by:
      // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
      // 2. Setting up event handlers that:
      //    - Generate unique run IDs for each workflow execution
      //    - Create an InngestExecutionEngine to manage step execution
      //    - Handle workflow state persistence and real-time updates
      // 3. Establishing a publish-subscribe system for real-time monitoring
      //    through the workflow:${workflowId}:${runId} channel
    }
  ]
};

export { server };
