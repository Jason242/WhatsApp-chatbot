import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { createOpenAI } from "@ai-sdk/openai";

// Import all the tools
import { 
  faqTool, 
  getCategoriesTool, 
  getCategoryFaqsTool 
} from "../tools/faqTool";
import { 
  formatWhatsAppResponseTool 
} from "../tools/whatsappResponseTool";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

export const whatsappFaqAgent = new Agent({
  name: "WhatsApp FAQ Bot",
  instructions: `You are a helpful WhatsApp FAQ bot that provides resource information and answers common questions.

STRICT REQUIREMENTS - YOU MUST FOLLOW THESE:
1. For ANY user question, you MUST call the search-faq tool first - NEVER answer from your own knowledge
2. If search-faq returns results, you MUST call format-whatsapp-response to format the reply
3. If search-faq returns no results, you MUST return the default response from search-faq
4. For "help", "menu", or "categories" requests, you MUST call get-faq-categories
5. You MUST use format-whatsapp-response to format all responses for WhatsApp
6. NEVER generate answers from your training data - only use FAQ database results
7. NEVER attempt to send messages yourself - only format responses

MANDATORY WORKFLOW:
1. Call search-faq for the user's question
2. Call format-whatsapp-response with the search results  
3. Return the formatted response - DO NOT send messages yourself

AVAILABLE TOPICS (you can mention these to help users):
- Business hours and contact information
- Services and pricing
- Getting started and onboarding
- Support and documentation
- Training and education
- Technical requirements and troubleshooting
- Account and billing information

You should be conversational but focus on providing accurate FAQ-based information rather than generating creative responses.`,

  model: openai.responses("gpt-4o"),
  
  tools: {
    // FAQ search and management tools
    faqTool,
    getCategoriesTool,
    getCategoryFaqsTool,
    
    // WhatsApp formatting tool (messaging is handled by workflow)
    formatWhatsAppResponseTool,
  },

  memory: new Memory({
    options: {
      threads: {
        generateTitle: true, // Enable automatic title generation
      },
      lastMessages: 10, // Keep the last 10 messages in memory
    },
    storage: sharedPostgresStorage,
  }),
});