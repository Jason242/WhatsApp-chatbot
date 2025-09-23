import { Inngest } from "inngest";
import { serve } from "inngest/hono";

// Create Inngest client
export const inngest = new Inngest({
  id: "moki-whatsapp-bot",
  name: "MOKI WhatsApp Bot",
});

// Create Inngest serve handler
export const inngestServe = serve({
  client: inngest,
  functions: [],
});
