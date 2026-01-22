# 🤖 AI Chatbot Setup Guide

This chatbot uses **Groq API** which is **100% FREE** and **VERY FAST**! (No credit card required)

## 🚀 Quick Setup (2 Minutes)

### Step 1: Get Your Free API Key
1. Go to https://console.groq.com
2. Click **"Sign Up"** (use Google/Github for quick signup)
3. Once logged in, go to **API Keys** section
4. Click **"Create API Key"**
5. Give it a name (e.g., "Foodie Chatbot")
6. **Copy the API key** (starts with `gsk_...`)

### Step 2: Add to Your Project
1. Open `backend/.env` file
2. Add this line:
   ```
   GROQ_API_KEY=gsk_your_copied_key_here
   ```
3. Save the file

### Step 3: Restart Backend
```bash
cd backend
npm run dev
```

You should see: `🤖 AI Chatbot: Enabled (Groq API - Fast & Free) ✅`

## ✅ That's It!

Your chatbot is now AI-powered and will:
- ✅ Think and understand context (not just keyword matching)
- ✅ Give intelligent, natural responses
- ✅ Remember conversation history
- ✅ Respond in 1-2 seconds (super fast!)
- ✅ Work immediately (no model loading delays)

## 🎯 Why Groq?

- **100% FREE** - No credit card, no limits for personal projects
- **VERY FAST** - Responses in 1-2 seconds (uses powerful GPUs)
- **RELIABLE** - No cold starts, always ready
- **EASY** - Simple API, works immediately
- **POWERFUL** - Uses Llama 3.1 model (very smart!)

## ⚠️ Troubleshooting

**"Using fallback mode" message:**
- Make sure you added `GROQ_API_KEY` to your `.env` file
- Check for typos in the key
- Restart your backend server after adding the key

**Slow responses:**
- Groq should be very fast (1-2 seconds)
- If slow, check your internet connection
- Verify your API key is correct

**API errors:**
- Verify your API key is correct
- Make sure you're logged into Groq console
- Check if you've reached any limits (unlikely on free tier)

## 💡 How It Works

1. User sends a message
2. Backend sends message + conversation history to Groq API
3. AI "thinks" and generates intelligent response
4. Response sent back to user
5. Conversation context saved for next message

The chatbot now **actually thinks** instead of just matching keywords! 🧠

## 🎉 Test It Out!

Try asking:
- "What's your name?" (should get a creative answer)
- "Tell me a joke"
- "What do you recommend?"
- "I'm hungry, help me decide"

You'll see the AI actually understands and responds naturally! 

Enjoy your intelligent chatbot! 🚀
