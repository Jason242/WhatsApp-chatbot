import { initializeWhatsAppBot } from './whatsappBot';
import { mastra } from './mastra';

async function main() {
  const logger = mastra.getLogger();
  
  console.log('🤖 Starting WhatsApp FAQ Bot...');
  logger?.info('🔧 [Startup] Starting WhatsApp FAQ Bot');
  
  try {
    // Initialize the WhatsApp bot
    await initializeWhatsAppBot();
    
    console.log('✅ WhatsApp FAQ Bot is running!');
    console.log('📱 Users can now message you for FAQ assistance');
    console.log('💡 The bot will respond with predefined answers using keyword matching');
    console.log('⚠️  Keep this process running to maintain the connection');
    
    logger?.info('✅ [Startup] WhatsApp FAQ Bot startup completed successfully');

  } catch (error) {
    console.error('❌ Failed to start WhatsApp FAQ Bot:', error);
    logger?.error('❌ [Startup] Failed to start WhatsApp FAQ Bot', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}

// Run the bot
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});