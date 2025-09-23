# WhatsApp-chatbot
A WhatsApp FAQ bot that provides instant answers to resource-related questions using deterministic keyword matching (no AI/ChatGPT integration)

## Prerequisites

- Node.js >= 20.9.0
- Google Chrome or Chromium installed locally (required for WhatsApp Web automation)
- WhatsApp mobile app with the ability to link a device

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. (Optional) Configure environment variables by creating a `.env` file:

   ```bash
   PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   PUPPETEER_HOME_DIR="./.chrome-home"
   QR_SERVER_PORT=8081
   DEFAULT_NEWS_FEED_URL="https://feeds.bbci.co.uk/news/rss.xml"
   RSS_FEED_URL="https://your-alt-feed"
   API_FEED_URL="https://your-json-api"
   ```

   - `PUPPETEER_EXECUTABLE_PATH` points Puppeteer at an installed Chrome/Chromium binary when the bundled copy cannot launch.
   - `PUPPETEER_HOME_DIR` overrides Chrome's home/profile directory so the browser can write data in environments that restrict access to `~/Library` (the default value is a `.chrome-home` directory inside the project).
   - `QR_SERVER_PORT` customizes the local HTTP server that serves the QR code (defaults to `8081`).

## Running the bot

Start the TypeScript bot (recommended):

```bash
npx tsx src/startWhatsAppBot.ts
```

First launch prints a QR code. Scan it with WhatsApp → Settings → Linked Devices → Link a Device. The session is cached under `.wwebjs_auth/` by `LocalAuth`, so you only need to scan once per machine.

Prefer a browser view? While the bot is running, open <http://localhost:8081> to display the current QR code (served locally; configure `QR_SERVER_PORT` to change the port).

Need a quick smoke test without the Mastra stack? Run the simple CommonJS starter:

```bash
node start.cjs
```

Keep the process running so the bot stays connected.

## Troubleshooting

- **Browser fails to launch**: Ensure Chrome/Chromium is installed. Set `PUPPETEER_EXECUTABLE_PATH` to your Chrome binary (e.g. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS) and restart.
- **No QR code in terminal**: Widen the terminal and ensure ANSI output is enabled; `qrcode-terminal` prints the QR using ASCII characters.
- **News command returns nothing**: The bot defaults to the BBC RSS feed. Override with `DEFAULT_NEWS_FEED_URL`, `RSS_FEED_URL`, or `API_FEED_URL`. Outbound HTTPS access is required.
- **Session issues**: Delete the `.wwebjs_auth/` folder to force a fresh device link.

## Development scripts

- `npm run check` – type-checks the project
- `npm run format` – format source files with Prettier
