const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

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
    console.log('\n📱 Scan this QR code with your WhatsApp to connect:');
    qrcode.generate(qr, { small: true });
    console.log('\nOpen WhatsApp on your phone → Settings → Linked Devices → Link a Device');
  });

  // Ready event
  client.on('ready', () => {
    console.log('✅ MOKI WhatsApp FAQ Bot is ready and connected!');
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

    console.log('📨 Received message:', messageBody);

    // Only process text messages
    if (message.type !== 'chat') {
      return;
    }

    // Skip empty messages
    if (!messageBody.trim()) {
      return;
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
    return "MOKI WhatsApp FAQ Bot - Here to help with:\n\n📅 Calendar: School hours, holidays, daily schedule\n🎉 Events: Upcoming events, field trips, parent activities\n📞 Contact: MOKI contact info, parent contact list\n🚨 Emergency: Emergency procedures, medication policy\n💰 Policies: Tuition, fees, dress code\n📢 Announcements: Weekly updates every Monday at 12:00 PM GMT+2\n\nJust ask me about any of these topics!";
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
  console.log('🤖 Starting MOKI WhatsApp FAQ Bot...');
  
  try {
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
