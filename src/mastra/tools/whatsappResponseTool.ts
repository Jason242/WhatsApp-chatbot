import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

// Store the WhatsApp client instance globally for tool access
// This will be set by the WhatsApp client setup code
let whatsappClient: any = null;

export function setWhatsAppClient(client: any) {
  whatsappClient = client;
}

export function getWhatsAppClient() {
  return whatsappClient;
}

export const sendWhatsAppMessageTool = createTool({
  id: "send-whatsapp-message",
  description: `Sends a message to a WhatsApp chat. Use this tool to respond to user messages with FAQ answers or other information.`,
  inputSchema: z.object({
    chatId: z.string().describe("The WhatsApp chat ID or phone number to send the message to"),
    message: z.string().describe("The message content to send"),
    quotedMessageId: z.string().optional().describe("Optional: ID of the message to quote/reply to"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
    error: z.string().optional(),
    chatId: z.string(),
  }),
  execute: async ({ context: { chatId, message, quotedMessageId }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [WhatsApp Response Tool] Starting message send', { 
      chatId, 
      messageLength: message.length,
      hasQuotedMessage: !!quotedMessageId 
    });
    
    try {
      if (!whatsappClient) {
        logger?.error('❌ [WhatsApp Response Tool] WhatsApp client not initialized');
        return {
          success: false,
          error: "WhatsApp client is not connected. Please ensure the bot is properly initialized.",
          chatId,
        };
      }

      if (!whatsappClient.info || !whatsappClient.info.wid) {
        logger?.error('❌ [WhatsApp Response Tool] WhatsApp client not authenticated');
        return {
          success: false,
          error: "WhatsApp client is not authenticated. Please scan the QR code to connect.",
          chatId,
        };
      }

      logger?.info('📝 [WhatsApp Response Tool] Preparing to send message');
      
      // Format the chat ID properly (ensure it ends with @c.us for individual chats)
      let formattedChatId = chatId;
      if (!chatId.includes('@')) {
        // If it's just a phone number, format it properly
        formattedChatId = `${chatId}@c.us`;
      }

      logger?.info('📝 [WhatsApp Response Tool] Formatted chat ID', { 
        originalChatId: chatId, 
        formattedChatId 
      });

      // Send the message
      const messageOptions: any = {
        chatId: formattedChatId,
        message: message,
      };

      if (quotedMessageId) {
        messageOptions.quotedMessageId = quotedMessageId;
      }

      logger?.info('📝 [WhatsApp Response Tool] Sending message through WhatsApp client...');
      const sentMessage = await whatsappClient.sendMessage(formattedChatId, message, messageOptions);
      
      logger?.info('✅ [WhatsApp Response Tool] Message sent successfully', { 
        messageId: sentMessage.id?._serialized,
        chatId: formattedChatId,
        messageLength: message.length
      });

      return {
        success: true,
        messageId: sentMessage.id?._serialized || sentMessage.id,
        chatId: formattedChatId,
      };

    } catch (error) {
      logger?.error('❌ [WhatsApp Response Tool] Error sending message', { 
        error: error instanceof Error ? error.message : String(error),
        chatId,
        messageLength: message.length
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred while sending message",
        chatId,
      };
    }
  },
});

export const checkWhatsAppStatusTool = createTool({
  id: "check-whatsapp-status",
  description: `Checks the status of the WhatsApp client connection.`,
  inputSchema: z.object({}),
  outputSchema: z.object({
    connected: z.boolean(),
    authenticated: z.boolean(),
    clientInfo: z.object({
      phone: z.string().optional(),
      name: z.string().optional(),
      batteryLevel: z.number().optional(),
    }).optional(),
    status: z.string(),
  }),
  execute: async ({ mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [WhatsApp Status Tool] Checking WhatsApp client status');
    
    try {
      if (!whatsappClient) {
        logger?.info('📝 [WhatsApp Status Tool] Client not initialized');
        return {
          connected: false,
          authenticated: false,
          status: "Client not initialized",
        };
      }

      const state = await whatsappClient.getState();
      const isConnected = state === 'CONNECTED';
      const isAuthenticated = !!whatsappClient.info?.wid;

      let clientInfo = {};
      if (isAuthenticated && whatsappClient.info) {
        clientInfo = {
          phone: whatsappClient.info.wid?.user,
          name: whatsappClient.info.pushname,
          batteryLevel: whatsappClient.info.battery,
        };
      }

      logger?.info('✅ [WhatsApp Status Tool] Status checked', { 
        state,
        connected: isConnected,
        authenticated: isAuthenticated,
        clientInfo
      });

      return {
        connected: isConnected,
        authenticated: isAuthenticated,
        clientInfo: Object.keys(clientInfo).length > 0 ? clientInfo : undefined,
        status: `State: ${state}, Connected: ${isConnected}, Authenticated: ${isAuthenticated}`,
      };

    } catch (error) {
      logger?.error('❌ [WhatsApp Status Tool] Error checking status', { 
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        connected: false,
        authenticated: false,
        status: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const formatWhatsAppResponseTool = createTool({
  id: "format-whatsapp-response",
  description: `Formats FAQ responses for WhatsApp messaging with proper formatting and structure.`,
  inputSchema: z.object({
    faqResults: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.string(),
    })),
    hasResults: z.boolean(),
    searchQuery: z.string(),
    defaultResponse: z.string().optional(),
  }),
  outputSchema: z.object({
    formattedMessage: z.string(),
    messageType: z.enum(["faq_results", "default_response", "error"]),
  }),
  execute: async ({ context: { faqResults, hasResults, searchQuery, defaultResponse }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [WhatsApp Format Tool] Formatting FAQ response', { 
      hasResults, 
      resultCount: faqResults.length,
      searchQuery
    });
    
    try {
      if (!hasResults || faqResults.length === 0) {
        const message = defaultResponse || "I couldn't find an answer to your question. Please contact our support team for assistance.";
        
        logger?.info('📝 [WhatsApp Format Tool] Using default response');
        return {
          formattedMessage: message,
          messageType: "default_response" as const,
        };
      }

      // Format multiple FAQ results
      if (faqResults.length === 1) {
        const result = faqResults[0];
        const formattedMessage = `*${result.question}*\n\n${result.answer}`;
        
        logger?.info('✅ [WhatsApp Format Tool] Formatted single FAQ result', { 
          questionId: result.id,
          category: result.category
        });

        return {
          formattedMessage,
          messageType: "faq_results" as const,
        };
      } else {
        // Multiple results
        let formattedMessage = `I found ${faqResults.length} answers that might help:\n\n`;
        
        faqResults.forEach((result, index) => {
          formattedMessage += `*${index + 1}. ${result.question}*\n${result.answer}\n\n`;
        });

        // Add footer for multiple results
        formattedMessage += "If you need more specific help, feel free to ask another question! 😊";

        logger?.info('✅ [WhatsApp Format Tool] Formatted multiple FAQ results', { 
          resultCount: faqResults.length,
          categories: faqResults.map(r => r.category)
        });

        return {
          formattedMessage,
          messageType: "faq_results" as const,
        };
      }

    } catch (error) {
      logger?.error('❌ [WhatsApp Format Tool] Error formatting response', { 
        error: error instanceof Error ? error.message : String(error),
        hasResults,
        resultCount: faqResults.length
      });

      return {
        formattedMessage: "I'm sorry, I encountered an error while formatting the response. Please try again or contact our support team.",
        messageType: "error" as const,
      };
    }
  },
});