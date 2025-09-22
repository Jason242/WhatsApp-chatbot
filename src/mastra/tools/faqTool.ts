import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";
import { FAQMatcher, type FAQItem } from "../data/faqData";

const faqMatcher = new FAQMatcher();

export const faqTool = createTool({
  id: "search-faq",
  description: `Searches the FAQ database for answers to user questions about resources, services, support, pricing, and general information. Use this tool when users ask questions that might be answered in the FAQ.`,
  inputSchema: z.object({
    query: z.string().describe("The user's question or search term"),
    maxResults: z.number().default(3).describe("Maximum number of FAQ results to return (default: 3)"),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.string(),
    })),
    hasResults: z.boolean(),
    searchQuery: z.string(),
    defaultResponse: z.string().optional(),
  }),
  execute: async ({ context: { query, maxResults = 3 }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [FAQ Tool] Starting FAQ search', { query, maxResults });
    
    try {
      // Search the FAQ database
      logger?.info('📝 [FAQ Tool] Searching FAQ database...');
      const searchResults = faqMatcher.search(query, maxResults);
      
      if (searchResults.length > 0) {
        logger?.info('✅ [FAQ Tool] Found FAQ results', { 
          resultCount: searchResults.length,
          results: searchResults.map(r => ({ id: r.id, question: r.question, category: r.category }))
        });
        
        return {
          results: searchResults.map(item => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            category: item.category,
          })),
          hasResults: true,
          searchQuery: query,
        };
      } else {
        logger?.info('📝 [FAQ Tool] No FAQ matches found, returning default response');
        const defaultResponse = faqMatcher.getDefaultResponse();
        
        return {
          results: [],
          hasResults: false,
          searchQuery: query,
          defaultResponse,
        };
      }
    } catch (error) {
      logger?.error('❌ [FAQ Tool] Error during FAQ search', { error, query });
      
      // Return fallback response on error
      return {
        results: [],
        hasResults: false,
        searchQuery: query,
        defaultResponse: "I'm sorry, I'm having trouble accessing the FAQ database right now. Please contact our support team at support@company.com or call (555) 123-4567 for assistance.",
      };
    }
  },
});

export const getCategoriesTool = createTool({
  id: "get-faq-categories",
  description: `Gets all available FAQ categories to help users understand what topics are covered.`,
  inputSchema: z.object({}),
  outputSchema: z.object({
    categories: z.array(z.string()),
  }),
  execute: async ({ mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [Categories Tool] Getting FAQ categories');
    
    try {
      const categories = faqMatcher.getCategories();
      logger?.info('✅ [Categories Tool] Retrieved categories', { categories });
      
      return {
        categories,
      };
    } catch (error) {
      logger?.error('❌ [Categories Tool] Error getting categories', { error });
      return {
        categories: [],
      };
    }
  },
});

export const getCategoryFaqsTool = createTool({
  id: "get-category-faqs",
  description: `Gets all FAQ items from a specific category.`,
  inputSchema: z.object({
    category: z.string().describe("The FAQ category to retrieve items from"),
  }),
  outputSchema: z.object({
    items: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.string(),
    })),
    category: z.string(),
  }),
  execute: async ({ context: { category }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [Category FAQs Tool] Getting FAQs for category', { category });
    
    try {
      const items = faqMatcher.getByCategory(category);
      logger?.info('✅ [Category FAQs Tool] Retrieved FAQs for category', { 
        category, 
        itemCount: items.length,
        items: items.map(i => ({ id: i.id, question: i.question }))
      });
      
      return {
        items: items.map(item => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.category,
        })),
        category,
      };
    } catch (error) {
      logger?.error('❌ [Category FAQs Tool] Error getting category FAQs', { error, category });
      return {
        items: [],
        category,
      };
    }
  },
});