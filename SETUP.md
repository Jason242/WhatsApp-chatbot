# MOKI WhatsApp Bot Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables (Optional)
```bash
# Set Chrome executable path (if bundled Chromium fails)
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Set QR server port (default: 8081)
export QR_SERVER_PORT=8081
```

### 3. Start the Bot
```bash
npm start
```

## 📱 How to Connect

1. **Start the bot** - Run `npm start`
2. **Open browser** - Go to `http://localhost:8081`
3. **Scan QR code** - Use WhatsApp on your phone:
   - Open WhatsApp → Settings → Linked Devices → Link a Device
   - Scan the QR code displayed in your browser
4. **Ready!** - The bot will be connected and ready to help

## 🤖 Available Commands

Once connected, users can ask about:

- **Hours**: "What are MOKI's hours?"
- **Events**: "What events are coming up?"
- **Contact**: "How can I contact MOKI?"
- **Parent Directory**: "How do I get the parents contact list?"
- **Announcements**: "When are announcements made?"
- **Sick Policy**: "What's the sick child policy?"
- **Pickup/Dropoff**: "What are the pickup procedures?"
- **Tuition**: "What are the fees?"
- **Help**: "Help" or "Menu"

## 🔧 Troubleshooting

### Chrome/Puppeteer Issues
If you get Chrome connection errors:
```bash
# Install Chrome for Puppeteer
npx puppeteer browsers install chrome

# Or set custom Chrome path
export PUPPETEER_EXECUTABLE_PATH="/path/to/your/chrome"
```

### Port Already in Use
If port 8081 is busy:
```bash
export QR_SERVER_PORT=8082
npm start
```

### WhatsApp Connection Issues
- Make sure your phone has internet connection
- Try refreshing the QR code page
- Restart the bot if authentication fails

## 📋 Features

- **Web-based QR Code**: Easy scanning via browser
- **Auto-refresh**: QR page updates every 10 seconds
- **Status API**: Check connection status at `/api/status`
- **MOKI-specific FAQs**: All responses tailored for kindergarten parents
- **Monday Announcements**: Built-in info about 12:00 PM GMT+2 schedule

## 🛑 Stopping the Bot

Press `Ctrl+C` in the terminal to gracefully shut down the bot.

## 📞 Support

For issues with the bot, contact:
- MOKI Main Office: +1 (555) 123-MOKI
- Director Email: director@moki.edu
