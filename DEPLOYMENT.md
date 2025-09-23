# MOKI WhatsApp Bot - Cloud Deployment Guide

## 🚀 **Deploy to Cloud (Recommended)**

Choose one of these platforms to host your bot 24/7:

### Option 1: Railway (Easiest)

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select this repository
3. **Deploy**: Railway will automatically detect the `railway.json` config
4. **Get URL**: Railway will give you a URL like `https://your-app.railway.app`
5. **Access QR**: Go to `https://your-app.railway.app:8081` to scan QR code

### Option 2: Render (Free Tier Available)

1. **Sign up** at [render.com](https://render.com)
2. **New Web Service** → Connect GitHub repository
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `node start-with-qr-server.cjs`
   - Environment: Docker
4. **Deploy** and get your URL
5. **Access QR**: Go to `https://your-app.onrender.com:8081`

### Option 3: DigitalOcean App Platform

1. **Sign up** at [digitalocean.com](https://digitalocean.com)
2. **Create App** → Connect GitHub repository
3. **Configure**:
   - Source: GitHub repository
   - Dockerfile path: `./Dockerfile`
   - Port: 8081
4. **Deploy** and get your URL

## 📱 **Setup Process**

### Step 1: Deploy to Cloud
- Follow one of the options above
- Wait for deployment to complete
- Get your app URL (e.g., `https://moki-bot.railway.app`)

### Step 2: Connect WhatsApp
1. **Visit QR page**: `https://your-app-url:8081`
2. **Scan QR code** with your phone:
   - WhatsApp → Settings → Linked Devices → Link a Device
3. **Bot connects** and shows "✅ Ready and connected!"

### Step 3: Create MOKI Group Chat
1. **Create WhatsApp group** called "MOKI Parents"
2. **Add the bot** to the group (it's now connected to your WhatsApp)
3. **Test**: Send "help" in the group
4. **Bot responds** with MOKI FAQ information

## 🔧 **Environment Variables**

Set these in your cloud platform:

```bash
NODE_ENV=production
QR_SERVER_PORT=8081
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## 📊 **Monitoring**

- **Health Check**: `https://your-app-url:8081/api/status`
- **Logs**: Check your cloud platform's logs section
- **QR Code**: `https://your-app-url:8081/qr.png`

## 🎯 **How It Works**

1. **Bot runs 24/7** on cloud server
2. **Connected to WhatsApp** via your account
3. **Responds to group messages** automatically
4. **Provides MOKI FAQs** when parents ask questions
5. **Announcement reminders** about Monday 12:00 PM GMT+2 schedule

## 🔄 **Updates**

To update the bot:
1. **Push changes** to GitHub
2. **Cloud platform auto-deploys** (Railway/Render)
3. **Bot restarts** with new features

## 💰 **Costs**

- **Railway**: $5/month for hobby plan
- **Render**: Free tier available (with limitations)
- **DigitalOcean**: $5/month for basic plan

## 🆘 **Troubleshooting**

### Bot Not Responding
- Check logs in cloud platform
- Verify WhatsApp connection at `/api/status`
- Restart deployment if needed

### QR Code Issues
- Clear browser cache
- Try incognito/private mode
- Check if port 8081 is accessible

### Group Chat Issues
- Ensure bot is added to the group
- Check if bot has permission to send messages
- Verify group settings allow bot responses

## 📞 **Support**

For deployment issues:
- Check cloud platform documentation
- Review logs for error messages
- Contact platform support if needed

---

**Your MOKI WhatsApp Bot will be live 24/7 and ready to help parents with their questions!**
