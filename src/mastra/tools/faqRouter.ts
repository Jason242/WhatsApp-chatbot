import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { RuntimeContext } from "@mastra/core/di";
import { z } from "zod";
import { FAQMatcher } from "../data/faqData";
import { newsFeedTool, formatNewsResponseTool } from "./newsFeedTool";

const faqMatcher = new FAQMatcher();

// Helper function to detect help requests
function isHelpRequest(message: string): boolean {
  const helpKeywords = ['help', 'menu', 'options', 'categories', 'topics', 'what can you do', 'commands', 'start'];
  return helpKeywords.some(keyword => message.includes(keyword));
}

// Helper function to detect news requests
function isNewsRequest(message: string): boolean {
  const newsKeywords = ['news', 'latest news', 'current news', 'headlines', 'updates', 'feed', 'articles'];
  return newsKeywords.some(keyword => message.includes(keyword));
}

// Helper function to extract category requests
function extractCategoryRequest(message: string): string | null {
  // Check for "category:name" pattern
  const categoryMatch = message.match(/category:\s*(\w+)/);
  if (categoryMatch) {
    return categoryMatch[1];
  }

  // Check for "show/get [category]" patterns
  const availableCategories = faqMatcher.getCategories();
  for (const category of availableCategories) {
    const patterns = [
      `show ${category}`,
      `get ${category}`,
      `${category} info`,
      `${category} questions`,
      category.toLowerCase()
    ];
    
    if (patterns.some(pattern => message.includes(pattern))) {
      return category;
    }
  }

  return null;
}

// Handle help/menu requests
function handleHelpRequest(logger?: IMastraLogger): any {
  logger?.info('📝 [FAQ Router] Generating help response');
  
  const categories = faqMatcher.getCategories();
  
  let response = "*Welcome to our FAQ Bot! 🤖*\n\n";
  response += "I can help you with questions about:\n\n";
  
  categories.forEach((category, index) => {
    response += `${index + 1}. *${category.charAt(0).toUpperCase() + category.slice(1)}*\n`;
  });
  
  response += "\n*How to use:*\n";
  response += "• Just ask a question naturally\n";
  response += "• Type 'category:[name]' for specific topics\n";
  response += "• Ask about hours, contact, pricing, support, etc.\n";
  response += "• Type 'news' for latest news updates\n\n";
  response += "Example: \"What are your hours?\" or \"category:pricing\" or \"news\"";

  logger?.info('✅ [FAQ Router] Generated help response', { 
    categoriesCount: categories.length 
  });

  return {
    response,
    responseType: "help" as const,
    matchedCategories: categories,
  };
}

// Handle news requests
async function handleNewsRequest(logger?: IMastraLogger): Promise<any> {
  logger?.info('📝 [FAQ Router] Processing news request');
  
  try {
    // Fetch news from the feed
    const newsResult = await newsFeedTool.execute({
      context: { source: "default", limit: 5 },
      mastra: { getLogger: () => logger } as any,
      runtimeContext: new RuntimeContext(),
    });
    
    if (newsResult.error) {
      logger?.error('❌ [FAQ Router] News fetch failed', { error: newsResult.error });
      return {
        response: "📰 Sorry, I couldn't fetch the latest news right now. Please try again later.",
        responseType: "default" as const,
      };
    }
    
    // Format the news response
    const formatResult = await formatNewsResponseTool.execute({
      context: { 
        articles: newsResult.articles,
        source: newsResult.source 
      },
      mastra: { getLogger: () => logger } as any,
      runtimeContext: new RuntimeContext(),
    });
    
    logger?.info('✅ [FAQ Router] Successfully processed news request', { 
      articleCount: newsResult.count,
      source: newsResult.source 
    });
    
    return {
      response: formatResult.formattedResponse,
      responseType: "news" as const,
    };
    
  } catch (error) {
    logger?.error('❌ [FAQ Router] Error processing news request', { error });
    return {
      response: "📰 Sorry, I encountered an error while fetching news. Please try again later.",
      responseType: "default" as const,
    };
  }
}

// Handle category-specific requests
function handleCategoryRequest(category: string, logger?: IMastraLogger): any {
  logger?.info('📝 [FAQ Router] Processing category request', { category });
  
  const categoryItems = faqMatcher.getByCategory(category);
  
  if (categoryItems.length === 0) {
    logger?.info('📝 [FAQ Router] Category not found, showing available categories');
    
    const availableCategories = faqMatcher.getCategories();
    let response = `I couldn't find the category "${category}". \n\n*Available categories:*\n\n`;
    
    availableCategories.forEach((cat, index) => {
      response += `${index + 1}. ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
    });
    
    response += `\nTry: "category:${availableCategories[0]}" or just ask a question!`;

    return {
      response,
      responseType: "category_list" as const,
      matchedCategories: availableCategories,
    };
  }

  // Format category FAQs
  let response = `*${category.charAt(0).toUpperCase() + category.slice(1)} - Frequently Asked Questions*\n\n`;
  
  categoryItems.forEach((item, index) => {
    response += `*${index + 1}. ${item.question}*\n${item.answer}\n\n`;
  });
  
  response += "Need help with something else? Just ask! 😊";

  logger?.info('✅ [FAQ Router] Generated category response', { 
    category,
    itemsCount: categoryItems.length 
  });

  return {
    response,
    responseType: "category_faqs" as const,
    matchedFaqs: categoryItems.map(item => item.id),
  };
}

// Handle general FAQ search
function handleFaqSearch(message: string, logger?: IMastraLogger): any {
  logger?.info('📝 [FAQ Router] Searching FAQ database', { query: message });
  
  const searchResults = faqMatcher.search(message, 3);
  
  if (searchResults.length === 0) {
    logger?.info('📝 [FAQ Router] No FAQ matches found');
    
    const defaultResponse = faqMatcher.getDefaultResponse();
    
    return {
      response: defaultResponse,
      responseType: "default" as const,
    };
  }

  // Format search results
  let response = "";
  
  if (searchResults.length === 1) {
    const result = searchResults[0];
    response = `*${result.question}*\n\n${result.answer}`;
  } else {
    response = `I found ${searchResults.length} answers that might help:\n\n`;
    
    searchResults.forEach((result, index) => {
      response += `*${index + 1}. ${result.question}*\n${result.answer}\n\n`;
    });
    
    response += "If you need more specific help, feel free to ask another question! 😊";
  }

  logger?.info('✅ [FAQ Router] Generated search results response', { 
    query: message,
    resultsCount: searchResults.length,
    matchedFaqs: searchResults.map(r => r.id)
  });

  return {
    response,
    responseType: "faq_results" as const,
    matchedFaqs: searchResults.map(r => r.id),
  };
}

export const routeFaqRequestTool = createTool({
  id: "route-faq-request",
  description: `Routes incoming WhatsApp messages to appropriate FAQ responses using deterministic keyword matching. Handles help requests, category requests, and general FAQ searches without AI.`,
  inputSchema: z.object({
    message: z.string().describe("The user's WhatsApp message"),
    chatId: z.string().describe("WhatsApp chat ID for context"),
  }),
  outputSchema: z.object({
    response: z.string(),
    responseType: z.enum(["help", "category_list", "category_faqs", "faq_results", "default"]),
    matchedCategories: z.array(z.string()).optional(),
    matchedFaqs: z.array(z.string()).optional(),
  }),
  execute: async ({ context: { message, chatId }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [FAQ Router] Processing incoming message', { 
      chatId, 
      messageLength: message.length,
      messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    });
    
    try {
      const normalizedMessage = message.toLowerCase().trim();
      logger?.info('📝 [FAQ Router] Normalized message', { normalizedMessage });

      // Route 1: Help/Menu requests
      if (isHelpRequest(normalizedMessage)) {
        logger?.info('📝 [FAQ Router] Detected help/menu request');
        return handleHelpRequest(logger);
      }

      // Route 2: News requests
      if (isNewsRequest(normalizedMessage)) {
        logger?.info('📝 [FAQ Router] Detected news request');
        return await handleNewsRequest(logger);
      }

      // Route 3: Category-specific requests (e.g., "category:pricing" or "show pricing")
      const categoryRequest = extractCategoryRequest(normalizedMessage);
      if (categoryRequest) {
        logger?.info('📝 [FAQ Router] Detected category request', { category: categoryRequest });
        return handleCategoryRequest(categoryRequest, logger);
      }

      // Route 4: General FAQ search
      logger?.info('📝 [FAQ Router] Processing as general FAQ search');
      return handleFaqSearch(normalizedMessage, logger);

    } catch (error) {
      logger?.error('❌ [FAQ Router] Error processing message', { 
        error: error instanceof Error ? error.message : String(error),
        chatId,
        message
      });

      return {
        response: "I'm sorry, I encountered an error while processing your request. Please try again or contact our support team at support@company.com or call (555) 123-4567.",
        responseType: "default" as const,
      };
    }
  },
});
