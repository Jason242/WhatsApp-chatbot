import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

// Simple RSS parser for news feeds
async function parseRSSFeed(feedUrl: string): Promise<any[]> {
  try {
    // For a more robust solution, you'd use a proper RSS parser like 'rss-parser'
    // This is a simplified example
    const response = await fetch(feedUrl);
    const xmlText = await response.text();
    
    // Basic XML parsing - in production, use a proper XML parser
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const descriptionMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1] || titleMatch[2] || 'No title',
          link: linkMatch[1],
          description: descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2]) : '',
          pubDate: new Date().toISOString()
        });
      }
    }
    
    return items.slice(0, 5); // Return latest 5 items
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return [];
  }
}

// Simple API fetch for JSON feeds
async function fetchAPIFeed(apiUrl: string): Promise<any[]> {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Handle different API response formats
    if (Array.isArray(data)) {
      return data.slice(0, 5);
    } else if (data.articles || data.items || data.results) {
      return (data.articles || data.items || data.results).slice(0, 5);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching API feed:', error);
    return [];
  }
}

export const newsFeedTool = createTool({
  id: "fetch-news",
  description: `Fetches the latest news articles from a configured news feed source. Supports RSS feeds and JSON APIs.`,
  inputSchema: z.object({
    source: z.string().default("default").describe("News source identifier (default, rss, api)"),
    limit: z.number().default(5).describe("Maximum number of articles to return (default: 5)"),
  }),
  outputSchema: z.object({
    articles: z.array(z.object({
      title: z.string(),
      link: z.string(),
      description: z.string(),
      pubDate: z.string(),
    })),
    source: z.string(),
    count: z.number(),
    error: z.string().optional(),
  }),
  execute: async ({ context: { source = "default", limit = 5 }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [News Feed Tool] Fetching news', { source, limit });
    
    try {
      // Configure your news sources here
      const newsSources = {
        default: process.env.DEFAULT_NEWS_FEED_URL || "https://feeds.bbci.co.uk/news/rss.xml",
        rss: process.env.RSS_FEED_URL || "https://feeds.bbci.co.uk/news/rss.xml",
        api: process.env.API_FEED_URL || "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY"
      };
      
      const feedUrl = newsSources[source as keyof typeof newsSources] || newsSources.default;
      
      if (!feedUrl) {
        return {
          articles: [],
          source,
          count: 0,
          error: "No news feed URL configured"
        };
      }
      
      let articles = [];
      
      // Determine if it's RSS or API based on URL
      if (feedUrl.includes('feeds.') || feedUrl.endsWith('.xml') || feedUrl.includes('rss')) {
        logger?.info('📡 [News Feed Tool] Parsing RSS feed', { feedUrl });
        articles = await parseRSSFeed(feedUrl);
      } else {
        logger?.info('📡 [News Feed Tool] Fetching API feed', { feedUrl });
        articles = await fetchAPIFeed(feedUrl);
      }
      
      // Format articles for WhatsApp
      const formattedArticles = articles.slice(0, limit).map(article => ({
        title: article.title || 'No title',
        link: article.link || article.url || '',
        description: article.description || article.summary || '',
        pubDate: article.pubDate || article.publishedAt || new Date().toISOString()
      }));
      
      logger?.info('✅ [News Feed Tool] Successfully fetched articles', { 
        count: formattedArticles.length,
        source 
      });
      
      return {
        articles: formattedArticles,
        source,
        count: formattedArticles.length
      };
      
    } catch (error) {
      logger?.error('❌ [News Feed Tool] Error fetching news', { error, source });
      
      return {
        articles: [],
        source,
        count: 0,
        error: `Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

export const formatNewsResponseTool = createTool({
  id: "format-news-response",
  description: `Formats news articles into a WhatsApp-friendly response format.`,
  inputSchema: z.object({
    articles: z.array(z.object({
      title: z.string(),
      link: z.string(),
      description: z.string(),
      pubDate: z.string(),
    })),
    source: z.string(),
  }),
  outputSchema: z.object({
    formattedResponse: z.string(),
  }),
  execute: async ({ context: { articles, source }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [Format News Tool] Formatting news response', { 
      articleCount: articles.length,
      source 
    });
    
    try {
      if (articles.length === 0) {
        return {
          formattedResponse: "📰 No news articles available at the moment. Please try again later."
        };
      }
      
      let response = `📰 *Latest News from ${source}*\n\n`;
      
      articles.forEach((article, index) => {
        const pubDate = new Date(article.pubDate).toLocaleDateString();
        response += `*${index + 1}. ${article.title}*\n`;
        if (article.description) {
          response += `${article.description.substring(0, 150)}${article.description.length > 150 ? '...' : ''}\n`;
        }
        if (article.link) {
          response += `🔗 ${article.link}\n`;
        }
        response += `📅 ${pubDate}\n\n`;
      });
      
      response += "💡 *Tip:* Ask me 'news' anytime for the latest updates!";
      
      logger?.info('✅ [Format News Tool] Successfully formatted news response', { 
        responseLength: response.length,
        articleCount: articles.length 
      });
      
      return {
        formattedResponse: response
      };
      
    } catch (error) {
      logger?.error('❌ [Format News Tool] Error formatting news response', { error });
      
      return {
        formattedResponse: "📰 Sorry, I couldn't format the news properly. Please try again later."
      };
    }
  },
});
