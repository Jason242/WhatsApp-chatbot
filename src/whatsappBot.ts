import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { toBuffer as generateQrBuffer } from 'qrcode';
import puppeteer from 'puppeteer';
import type { IMastraLogger } from '@mastra/core/logger';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { createServer, Server } from 'http';
import { setWhatsAppClient } from './mastra/tools/whatsappResponseTool.js';
import { routeFaqRequestTool } from './mastra/tools/faqRouter.js';
import { mastra } from './mastra/index.js';
import { RuntimeContext } from '@mastra/core/di';

let client: Client;

let latestQrText: string | null = null;
let latestQrImageBase64: string | null = null;
let latestQrUpdatedAt: string | null = null;
let qrServer: Server | null = null;
let qrServerListening = false;
const qrServerPort = Number(process.env.QR_SERVER_PORT || '8081');

export async function initializeWhatsAppBot() {
  const logger = mastra.getLogger();
  logger?.info('🔧 [WhatsApp Bot] Starting WhatsApp FAQ Bot initialization');

  if (client) {
    logger?.warn('📝 [WhatsApp Bot] initializeWhatsAppBot called while client already exists. Destroying previous instance.');
    try {
      await client.destroy();
    } catch (destroyError) {
      logger?.warn('📝 [WhatsApp Bot] Failed to destroy existing client before reinitialization', {
        error: destroyError instanceof Error ? destroyError.message : String(destroyError),
      });
    }
  }

  const executablePath = resolvePuppeteerExecutable(logger);
  const chromiumEnv = configureChromiumEnvironment(logger);

  try {
    const userDataDir = ensureChromiumProfileDir(logger);

    startQrServer(logger);

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
          '--disable-gpu',
          '--disable-crash-reporter',
          '--disable-breakpad',
          '--disable-features=OptimizationHints,TranslateUI',
          '--disable-software-rasterizer',
          `--homedir=${chromiumEnv.homeDir}`,
          `--user-data-dir=${userDataDir}`,
        ],
        ...(executablePath ? { executablePath } : {}),
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

function resolvePuppeteerExecutable(logger?: IMastraLogger) {
  const configuredPath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (configuredPath) {
    logger?.info('📝 [WhatsApp Bot] Using executable defined in PUPPETEER_EXECUTABLE_PATH', { executablePath: configuredPath });
    return configuredPath;
  }

  try {
    const bundledPath = puppeteer.executablePath();
    logger?.info('📝 [WhatsApp Bot] Using Puppeteer bundled Chromium executable', { executablePath: bundledPath });
    return bundledPath;
  } catch (error) {
    logger?.warn('📝 [WhatsApp Bot] Unable to resolve Puppeteer executable path automatically', {
      error: error instanceof Error ? error.message : String(error)
    });
    return undefined;
  }
}

function ensureChromiumProfileDir(logger?: IMastraLogger) {
  const profileDir = join(process.cwd(), '.chrome-data');
  try {
    mkdirSync(profileDir, { recursive: true });
  } catch (error) {
    logger?.warn('📝 [WhatsApp Bot] Unable to ensure Chromium profile directory', {
      error: error instanceof Error ? error.message : String(error),
      profileDir,
    });
  }
  return profileDir;
}

function configureChromiumEnvironment(logger?: IMastraLogger) {
  const forcedHome = process.env.PUPPETEER_HOME_DIR?.trim() || join(process.cwd(), '.chrome-home');
  try {
    mkdirSync(forcedHome, { recursive: true });
  } catch (error) {
    logger?.warn('📝 [WhatsApp Bot] Unable to ensure Chromium home directory', {
      error: error instanceof Error ? error.message : String(error),
      forcedHome,
    });
  }

  if (!process.env.PUPPETEER_USE_SYSTEM_HOME) {
    const previousHome = process.env.HOME;
    process.env.HOME = forcedHome;
    logger?.info('📝 [WhatsApp Bot] Overriding HOME for Chromium profile isolation', {
      previousHome,
      newHome: forcedHome,
    });
  }

  return { homeDir: forcedHome };
}

function startQrServer(logger?: IMastraLogger) {
  if (qrServerListening || qrServer) {
    return;
  }

  try {
    qrServer = createServer((req, res) => {
      const requestUrl = req.url ?? '/';

      if (requestUrl.startsWith('/qr.png')) {
        if (!latestQrImageBase64) {
          res.writeHead(503, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          res.end('QR code not yet available.');
          return;
        }

        const imageBuffer = Buffer.from(latestQrImageBase64, 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store',
        });
        res.end(imageBuffer);
        return;
      }

      if (requestUrl.startsWith('/api/status')) {
        const body = {
          hasQr: Boolean(latestQrText),
          updatedAt: latestQrUpdatedAt,
          qrString: latestQrText,
        };

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify(body));
        return;
      }

      const hasQr = Boolean(latestQrImageBase64);
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Cache-Control" content="no-store" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WhatsApp QR Code</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .card { background: #1e293b; padding: 32px; border-radius: 16px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.4); text-align: center; width: min(90vw, 380px); }
      img { width: 100%; max-width: 260px; border-radius: 12px; background: #fff; padding: 12px; }
      .title { font-size: 1.3rem; margin-bottom: 0.75rem; }
      .muted { color: #cbd5f5; font-size: 0.9rem; margin-bottom: 1.5rem; }
      .timestamp { color: #94a3b8; font-size: 0.8rem; margin-top: 1.25rem; }
      button { margin-top: 1.5rem; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
      button:hover { background: #0ea5e9; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">WhatsApp QR Code</div>
      <div class="muted">Scan with WhatsApp → Settings → Linked Devices → Link a Device.</div>
      ${hasQr ? `<img src="/qr.png?ts=${Date.now()}" alt="WhatsApp QR Code" />` : '<div class="muted">Waiting for QR code…</div>'}
      <button onclick="location.reload()">Refresh</button>
      <div class="timestamp">${latestQrUpdatedAt ? `Updated ${new Date(latestQrUpdatedAt).toLocaleString()}` : 'Awaiting first code'}.</div>
      <div class="timestamp">This page refreshes automatically every 10 seconds.</div>
    </div>
    <script>setTimeout(() => location.reload(), 10000);</script>
  </body>
</html>`;

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
    });

    qrServer.listen(qrServerPort, '127.0.0.1', () => {
      qrServerListening = true;
      const message = `QR code available at http://127.0.0.1:${qrServerPort}`;
      console.log(`ℹ️  ${message}`);
      logger?.info('📝 [WhatsApp Bot] ' + message);
    });

    qrServer.on('error', (error: any) => {
      qrServerListening = false;
      qrServer = null;
      logger?.error('❌ [WhatsApp Bot] QR server error', {
        error: error instanceof Error ? error.message : String(error),
        port: qrServerPort,
        code: typeof error === 'object' && error !== null ? (error as any).code : undefined,
      });
      console.error('❌ QR server error:', error);
    });

    qrServer.on('close', () => {
      qrServerListening = false;
      qrServer = null;
      logger?.info('📝 [WhatsApp Bot] QR server closed');
    });
  } catch (error) {
    logger?.error('❌ [WhatsApp Bot] Failed to start QR server', {
      error: error instanceof Error ? error.message : String(error),
      port: qrServerPort,
    });
  }
}

function setupEventListeners() {
  const logger = mastra.getLogger();

  // QR Code for authentication
  client.on('qr', async (qr) => {
    logger?.info('🔧 [WhatsApp Bot] QR Code received');
    console.log('\n📱 Scan this QR code with your WhatsApp to connect:');
    qrcode.generate(qr, { small: true });
    console.log('\nOpen WhatsApp on your phone → Settings → Linked Devices → Link a Device');

    startQrServer(logger);

    latestQrText = qr;
    latestQrUpdatedAt = new Date().toISOString();

    try {
      const pngBuffer = await generateQrBuffer(qr, { type: 'png', width: 256 });
      latestQrImageBase64 = pngBuffer.toString('base64');
      logger?.info('📝 [WhatsApp Bot] Updated QR image for web display', {
        bytes: pngBuffer.length,
        updatedAt: latestQrUpdatedAt,
      });
    } catch (error) {
      logger?.warn('📝 [WhatsApp Bot] Failed to render QR image', {
        error: error instanceof Error ? error.message : String(error),
      });
      latestQrImageBase64 = null;
    }
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
