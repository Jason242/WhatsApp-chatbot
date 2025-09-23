import 'dotenv/config';

import { initializeWhatsAppBot } from './whatsappBot.js';
import { mastra } from './mastra/index.js';

function logEnvironmentHints() {
  const logger = mastra.getLogger();

  if (!process.env.PUPPETEER_EXECUTABLE_PATH) {
    const message =
      'Using Puppeteer\'s bundled Chromium. Set PUPPETEER_EXECUTABLE_PATH to point at your installed Chrome if launch fails.';
    console.log(`ℹ️  ${message}`);
    logger?.info('ℹ️ [Startup] ' + message);
  } else {
    const message = `Using custom Chromium/Chrome at ${process.env.PUPPETEER_EXECUTABLE_PATH}`;
    console.log(`ℹ️  ${message}`);
    logger?.info('ℹ️ [Startup] ' + message);
  }

  if (!process.env.DEFAULT_NEWS_FEED_URL && !process.env.RSS_FEED_URL && !process.env.API_FEED_URL) {
    const message =
      'News feature falls back to BBC RSS. Define DEFAULT_NEWS_FEED_URL, RSS_FEED_URL, or API_FEED_URL to change the source.';
    console.log(`ℹ️  ${message}`);
    logger?.info('ℹ️ [Startup] ' + message);
  }
}

async function main() {
  const logger = mastra.getLogger();
  
  console.log('🤖 Starting WhatsApp FAQ Bot...');
  logger?.info('🔧 [Startup] Starting WhatsApp FAQ Bot');

  logEnvironmentHints();
  
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

    if (error instanceof Error && error.message.includes('Failed to launch the browser process')) {
      const hint =
        'Tip: Ensure Chrome/Chromium is installed. If Puppeteer cannot launch automatically, set PUPPETEER_EXECUTABLE_PATH to your Chrome binary (e.g. /Applications/Google Chrome.app/Contents/MacOS/Google Chrome on macOS).';
      console.error(`💡 ${hint}`);
      logger?.warn('💡 [Startup] ' + hint);
    }
    process.exit(1);
  }
}

// Run the bot
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
