import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { setWhatsAppClient } from './mastra/tools/whatsappResponseTool';
import { routeFaqRequestTool } from './mastra/tools/faqRouter';
import { mastra } from './mastra';
import { RuntimeContext } from '@mastra/core/di';

let client: Client;

export async function initializeWhatsAppBot() {
  const logger = mastra.getLogger();
  logger?.info('🔧 [WhatsApp Bot] Starting WhatsApp FAQ Bot initialization');

  try {
    // Create WhatsApp client with proper configuration for Replit
    client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    // Set up event listeners
    setupEventListeners();

    // Initialize the client
    logger?.info('📝 [WhatsApp Bot] Initializing WhatsApp Web client...');
    await client.initialize();

    // Make client available to response tools
    setWhatsAppClient(client);
    
    logger?.info('✅ [WhatsApp Bot] WhatsApp FAQ Bot initialized successfully');
    return client;

  } catch (error) {
    logger?.error('❌ [WhatsApp Bot] Failed to initialize WhatsApp bot', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

function setupEventListeners() {
  const logger = mastra.getLogger();

  // QR Code for authentication
  client.on('qr', (qr) => {
    logger?.info('🔧 [WhatsApp Bot] QR Code received');
    console.log('\n📱 Scan this QR code with your WhatsApp to connect:');
    qrcode.generate(qr, { small: true });
    console.log('\nOpen WhatsApp on your phone → Settings → Linked Devices → Link a Device');
  });

  // Ready event
  client.on('ready', () => {
    logger?.info('✅ [WhatsApp Bot] WhatsApp bot is ready and connected!');
    console.log('✅ WhatsApp FAQ Bot is ready and connected!');
  });

  // Authentication success
  client.on('authenticated', () => {
    logger?.info('📝 [WhatsApp Bot] WhatsApp authentication successful');
    console.log('📝 WhatsApp authentication successful');
  });

  // Authentication failure
  client.on('auth_failure', (msg) => {
    logger?.error('❌ [WhatsApp Bot] WhatsApp authentication failed', { message: msg });
    console.error('❌ WhatsApp authentication failed:', msg);
  });

  // Disconnected
  client.on('disconnected', (reason) => {
    logger?.info('📝 [WhatsApp Bot] WhatsApp client disconnected', { reason });
    console.log('📝 WhatsApp client disconnected:', reason);
  });

  // Message received - Main FAQ processing
  client.on('message', async (message) => {
    await handleIncomingMessage(message);
  });

  // Error handling
  client.on('error', (error) => {
    logger?.error('❌ [WhatsApp Bot] WhatsApp client error', {
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('❌ WhatsApp client error:', error);
  });
}

async function handleIncomingMessage(message: any) {
  const logger = mastra.getLogger();
  
  try {
    // Skip if message is from status or if it's from us
    if (message.from === 'status@broadcast' || message.fromMe) {
      return;
    }

    const chatId = message.from;
    const messageBody = message.body || '';

    logger?.info('🔧 [WhatsApp Bot] Processing incoming message', {
      chatId,
      messageLength: messageBody.length,
      messageType: message.type
    });

    // Only process text messages
    if (message.type !== 'chat') {
      logger?.info('📝 [WhatsApp Bot] Skipping non-text message', { 
        messageType: message.type 
      });
      return;
    }

    // Skip empty messages
    if (!messageBody.trim()) {
      logger?.info('📝 [WhatsApp Bot] Skipping empty message');
      return;
    }

    // Process the message through our deterministic router
    logger?.info('📝 [WhatsApp Bot] Routing message through FAQ system');
    
    const routerResult = await routeFaqRequestTool.execute({
      context: {
        message: messageBody,
        chatId: chatId,
      },
      mastra,
      // Add required runtimeContext (even if empty for this use case)
      runtimeContext: new RuntimeContext(),
    });

    logger?.info('📝 [WhatsApp Bot] FAQ routing completed', {
      responseType: routerResult.responseType,
      responseLength: routerResult.response.length,
      chatId
    });

    // Send the response back to WhatsApp
    logger?.info('📝 [WhatsApp Bot] Sending response to user');
    
    await client.sendMessage(chatId, routerResult.response);

    logger?.info('✅ [WhatsApp Bot] Response sent successfully', {
      chatId,
      responseType: routerResult.responseType
    });

  } catch (error) {
    logger?.error('❌ [WhatsApp Bot] Error processing message', {
      error: error instanceof Error ? error.message : String(error),
      chatId: message.from
    });

    // Send error response to user
    try {
      const errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again or contact our support team at support@company.com or call (555) 123-4567.";
      await client.sendMessage(message.from, errorMessage);
    } catch (sendError) {
      logger?.error('❌ [WhatsApp Bot] Failed to send error message', {
        error: sendError instanceof Error ? sendError.message : String(sendError)
      });
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  const logger = mastra.getLogger();
  logger?.info('📝 [WhatsApp Bot] Shutting down WhatsApp bot...');
  console.log('\n📝 Shutting down WhatsApp bot...');
  
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

// Export for external use
export { client };