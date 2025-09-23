const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const path = require('path');

let client;
let qrCode = null;
let isReady = false;

// Create Express server for QR code
const app = express();
const PORT = process.env.QR_SERVER_PORT || 8081;

// Serve static files
app.use(express.static('public'));

// QR code endpoint
app.get('/qr.png', (req, res) => {
  if (qrCode) {
    qrcode.toBuffer(qrCode, { type: 'png' }, (err, buffer) => {
      if (err) {
        res.status(500).send('Error generating QR code');
        return;
      }
      res.type('png').send(buffer);
    });
  } else {
    res.status(404).send('QR code not available');
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    ready: isReady,
    hasQR: !!qrCode,
    timestamp: new Date().toISOString()
  });
});

// Main page with QR code
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>MOKI WhatsApp Bot - QR Code</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            .logo {
                font-size: 2.5em;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 1.1em;
            }
            .qr-container {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
            }
            .qr-code {
                max-width: 300px;
                width: 100%;
                height: auto;
            }
            .status {
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                font-weight: bold;
            }
            .status.waiting {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            .status.ready {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .instructions {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: left;
            }
            .instructions h3 {
                margin-top: 0;
                color: #1976d2;
            }
            .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
            }
            .instructions li {
                margin: 8px 0;
                line-height: 1.5;
            }
            .refresh-notice {
                font-size: 0.9em;
                color: #666;
                margin-top: 20px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏫 MOKI</div>
            <div class="subtitle">WhatsApp FAQ Bot</div>
            
            <div id="status" class="status waiting">
                ${isReady ? '✅ Bot is ready and connected!' : '⏳ Waiting for QR code...'}
            </div>
            
            <div class="qr-container">
                <img id="qrImage" class="qr-code" src="/qr.png" alt="QR Code" style="display: ${qrCode ? 'block' : 'none'};">
                <div id="waiting" style="display: ${qrCode ? 'none' : 'block'};">
                    <p>⏳ Generating QR code...</p>
                </div>
            </div>
            
            <div class="instructions">
                <h3>📱 How to connect:</h3>
                <ol>
                    <li>Open WhatsApp on your phone</li>
                    <li>Go to <strong>Settings</strong> (three dots menu)</li>
                    <li>Select <strong>"Linked Devices"</strong></li>
                    <li>Tap <strong>"Link a Device"</strong></li>
                    <li>Scan the QR code above</li>
                </ol>
            </div>
            
            <div class="refresh-notice">
                This page auto-refreshes every 10 seconds
            </div>
        </div>
        
        <script>
            function updateStatus() {
                fetch('/api/status')
                    .then(response => response.json())
                    .then(data => {
                        const statusEl = document.getElementById('status');
                        const qrImage = document.getElementById('qrImage');
                        const waiting = document.getElementById('waiting');
                        
                        if (data.ready) {
                            statusEl.className = 'status ready';
                            statusEl.innerHTML = '✅ Bot is ready and connected!';
                            qrImage.style.display = 'none';
                            waiting.style.display = 'block';
                            waiting.innerHTML = '<p>✅ Connected! The bot is now ready to help with MOKI FAQs.</p>';
                        } else if (data.hasQR) {
                            statusEl.className = 'status waiting';
                            statusEl.innerHTML = '📱 Scan the QR code to connect';
                            qrImage.style.display = 'block';
                            waiting.style.display = 'none';
                            // Force refresh QR image
                            qrImage.src = '/qr.png?' + new Date().getTime();
                        } else {
                            statusEl.className = 'status waiting';
                            statusEl.innerHTML = '⏳ Waiting for QR code...';
                            qrImage.style.display = 'none';
                            waiting.style.display = 'block';
                            waiting.innerHTML = '<p>⏳ Generating QR code...</p>';
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
            
            // Update status every 10 seconds
            setInterval(updateStatus, 10000);
            
            // Initial load
            updateStatus();
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

async function initializeWhatsAppBot() {
  console.log('🤖 Starting MOKI WhatsApp FAQ Bot...');

  try {
    // Create WhatsApp client
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
    console.log('📝 Initializing WhatsApp Web client...');
    await client.initialize();

    console.log('✅ MOKI WhatsApp FAQ Bot initialized successfully');
    return client;

  } catch (error) {
    console.error('❌ Failed to initialize WhatsApp bot:', error);
    throw error;
  }
}

function setupEventListeners() {
  // QR Code for authentication
  client.on('qr', (qr) => {
    console.log('📱 QR Code received');
    qrCode = qr;
    
    console.log(`ℹ️  QR code available at http://127.0.0.1:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser to scan the QR code`);
    
    // Also show QR in terminal
    qrcode.toString(qr, { small: true }, (err, qrString) => {
      if (!err) {
        console.log('\n📱 Terminal QR Code:');
        console.log(qrString);
      }
    });
  });

  // Ready event
  client.on('ready', () => {
    console.log('✅ MOKI WhatsApp FAQ Bot is ready and connected!');
    isReady = true;
    qrCode = null; // Clear QR code once connected
  });

  // Authentication success
  client.on('authenticated', () => {
    console.log('📝 WhatsApp authentication successful');
  });

  // Authentication failure
  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
  });

  // Disconnected
  client.on('disconnected', (reason) => {
    console.log('📝 WhatsApp client disconnected:', reason);
    isReady = false;
  });

  // Message received - Simple FAQ responses
  client.on('message', async (message) => {
    await handleIncomingMessage(message);
  });

  // Error handling
  client.on('error', (error) => {
    console.error('❌ WhatsApp client error:', error);
  });
}

async function handleIncomingMessage(message) {
  try {
    // Skip if message is from status or if it's from us
    if (message.from === 'status@broadcast' || message.fromMe) {
      return;
    }

    const chatId = message.from;
    const messageBody = message.body || '';
    const isGroup = chatId.includes('@g.us');

    console.log('📨 Received message:', messageBody, isGroup ? '(from group)' : '(from individual)');

    // Only process text messages
    if (message.type !== 'chat') {
      return;
    }

    // Skip empty messages
    if (!messageBody.trim()) {
      return;
    }

    // For group chats, only respond if message mentions the bot or starts with specific keywords
    if (isGroup) {
      const lowerMessage = messageBody.toLowerCase();
      const mentionsBot = lowerMessage.includes('@moki') || 
                         lowerMessage.includes('bot') || 
                         lowerMessage.startsWith('moki') ||
                         lowerMessage.startsWith('help') ||
                         lowerMessage.includes('hours') ||
                         lowerMessage.includes('events') ||
                         lowerMessage.includes('contact') ||
                         lowerMessage.includes('announcement');
      
      if (!mentionsBot) {
        console.log('📝 Skipping group message (no bot mention)');
        return;
      }
    }

    // Simple FAQ responses based on keywords
    let response = getFAQResponse(messageBody.toLowerCase());

    // Send the response back to WhatsApp
    await client.sendMessage(chatId, response);
    console.log('✅ Response sent:', response);

  } catch (error) {
    console.error('❌ Error processing message:', error);

    // Send error response to user
    try {
      const errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again or contact MOKI at +1 (555) 123-MOKI.";
      await client.sendMessage(message.from, errorMessage);
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
  }
}

function getFAQResponse(message) {
  // MOKI FAQ responses
  if (message.includes('hours') || message.includes('time') || message.includes('open')) {
    return "MOKI operates:\n• Monday to Friday: 8:00 AM - 3:00 PM\n• Early drop-off: 7:30 AM (additional fee)\n• Extended care: 3:00 PM - 6:00 PM (additional fee)\n• Closed on weekends and public holidays";
  }
  
  if (message.includes('holiday') || message.includes('break') || message.includes('closed')) {
    return "MOKI holidays and early closing days are announced every Monday at 12:00 PM GMT+2 for that week.\n\nTypical holiday schedule:\n• Summer break: June 15 - August 20\n• Winter break: December 20 - January 5\n• Spring break: March 15 - March 22\n• Public holidays: New Year's Day, MLK Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas\n\nEarly closing days and schedule changes are announced via WhatsApp every Monday at 12:00 PM GMT+2.";
  }
  
  if (message.includes('event') || message.includes('activity') || message.includes('trip')) {
    return "Upcoming MOKI events this month:\n• Parent-Teacher Conferences: March 10-15\n• Spring Festival: March 22\n• Book Fair: March 25-29\n• Field Trip to Local Farm: April 5\n• Mother's Day Celebration: May 10\n\nEvent announcements are sent every Monday at 12:00 PM GMT+2. Check our WhatsApp group for the latest updates!";
  }
  
  if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
    return "MOKI Contact Information:\n• Main Office: +1 (555) 123-MOKI\n• Director Email: director@moki.edu\n• Teacher Line: +1 (555) 123-TEACH\n• Emergency Line: +1 (555) 123-HELP\n• Address: 123 Learning Lane, Education City, EC 12345\n• Office Hours: 7:30 AM - 5:30 PM, Monday-Friday\n\nAll announcements and updates are sent every Monday at 12:00 PM GMT+2";
  }
  
  if (message.includes('parent') || message.includes('contact list') || message.includes('directory')) {
    return "MOKI Parents Contact List:\n• Available through the main office\n• Email director@moki.edu to request access\n• Includes phone numbers and email addresses\n• Updated monthly with new families\n• Consent required from all parents before sharing\n• Used for playdates, carpooling, and emergency contact\n\nContact the office to add your information to the list.";
  }
  
  if (message.includes('announcement') || message.includes('monday') || message.includes('update')) {
    return "MOKI Announcement Schedule:\n• Every Monday at 12:00 PM GMT+2\n• Sent via WhatsApp group\n• Includes: holiday schedules, early closing days, event updates\n• Emergency announcements sent immediately\n• Weekly newsletter with detailed information\n• All parents automatically receive announcements\n\nMake sure your WhatsApp notifications are enabled!";
  }
  
  if (message.includes('sick') || message.includes('illness') || message.includes('fever')) {
    return "Sick child policy:\n• Children with fever (100.4°F+) must stay home\n• 24-hour fever-free before returning\n• No school with vomiting or diarrhea\n• Contagious illnesses require doctor's note to return\n• We'll call you immediately if your child becomes ill at school\n\nYour child's health and the health of all children is our priority.";
  }
  
  if (message.includes('pickup') || message.includes('drop-off') || message.includes('pick up')) {
    return "Pickup and drop-off procedures:\n• Drop-off: 8:00-8:30 AM at main entrance\n• Pickup: 3:00-3:30 PM at same entrance\n• Authorized pickup persons must show ID\n• Late pickup fee: $5 per 15 minutes after 3:30 PM\n• Emergency contacts must be on file\n• Notify us if someone else will pick up your child";
  }
  
  if (message.includes('tuition') || message.includes('fee') || message.includes('payment') || message.includes('cost')) {
    return "Current tuition and fees:\n• Monthly tuition: $800\n• Registration fee: $150 (annual)\n• Early drop-off: $5/day\n• Extended care: $10/day\n• Field trip fees: $15-25 per trip\n• Late pickup: $5 per 15 minutes\n\nPayment due by the 5th of each month. Sibling discounts available.";
  }
  
  if (message.includes('help') || message.includes('menu') || message.includes('info')) {
    return "🏫 MOKI WhatsApp FAQ Bot - Here to help with:\n\n📅 Calendar: School hours, holidays, daily schedule\n🎉 Events: Upcoming events, field trips, parent activities\n📞 Contact: MOKI contact info, parent contact list\n🚨 Emergency: Emergency procedures, medication policy\n💰 Policies: Tuition, fees, dress code\n📢 Announcements: Weekly updates every Monday at 12:00 PM GMT+2\n\n💡 In group chats, mention me with keywords like:\n• 'help' or 'moki'\n• 'hours', 'events', 'contact'\n• 'announcements' or 'parent contact list'\n\nJust ask me about any of these topics!";
  }
  
  // Default response
  return "I couldn't find a specific answer to your question. Here are some ways to get help:\n\n" +
         "• Contact MOKI main office at +1 (555) 123-MOKI\n" +
         "• Email the director at director@moki.edu\n" +
         "• Call our teacher line at +1 (555) 123-TEACH\n" +
         "• Ask me about: calendar, events, policies, emergency procedures, or general questions\n\n" +
         "Popular topics: MOKI hours, holidays, events, field trips, pickup/dropoff, sick policy, tuition, parent contact list, and announcements!\n\n" +
         "Remember: All announcements are sent every Monday at 12:00 PM GMT+2!";
}

async function main() {
  console.log('🤖 Starting MOKI WhatsApp FAQ Bot with QR Server...');
  
  try {
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🌐 QR Code server running at http://localhost:${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} in your browser to scan QR code`);
    });
    
    // Initialize the WhatsApp bot
    await initializeWhatsAppBot();
    
    console.log('✅ MOKI WhatsApp FAQ Bot is running!');
    console.log('📱 Users can now message you for FAQ assistance');
    console.log('💡 The bot will respond with MOKI-specific answers');
    console.log('⚠️  Keep this process running to maintain the connection');

  } catch (error) {
    console.error('❌ Failed to start MOKI WhatsApp FAQ Bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📝 Shutting down MOKI WhatsApp bot...');
  
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

// Run the bot
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
