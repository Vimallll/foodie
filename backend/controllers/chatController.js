const axios = require("axios");
const Food = require('../models/Food');

// In-memory conversation storage (for production, use Redis or database)
const conversations = new Map();

// Get or create conversation context
const getConversationContext = (sessionId) => {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      messages: [],
      createdAt: new Date(),
    });
  }
  return conversations.get(sessionId);
};

// Clean up old conversations (older than 1 hour)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, conv] of conversations.entries()) {
    if (now - conv.createdAt > 3600000) {
      conversations.delete(sessionId);
    }
  }
}, 300000); // Clean every 5 minutes

// AI-powered chatbot using Groq API (FREE, FAST, RELIABLE)
const getAIResponse = async (userMessage, conversationHistory = [], foodContext = "") => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  // Build conversation messages for Groq API
  const messages = [
    {
      role: "system",
      content: `You are a professional food delivery assistant for "Foodie" app (like Swiggy/Zomato).

AVAILABLE MENU ON OUR SYSTEM:
${foodContext}

Guidelines:
- ONLY recommend foods from the list above.
- If user asks for something not on the list, say it's currently unavailable.
- Keep responses SHORT and CONCISE (1 sentence, max 2 sentences)
- Be professional, friendly but brief
- No long explanations or lists
- Use emojis sparingly (only 1-2 per response)
- Answer directly without extra details
- Example good response: "We deliver in 30-40 minutes! 🚀"
- Example bad response: "Our estimated delivery time is 35-45 minutes..."

Be like Zomato/Swiggy: Quick, helpful, to the point.
   don't provide any other message ans which is didn't related to our system`
    }
  ];

  // Add conversation history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    });
  }

  // Add current user message
  messages.push({
    role: "user",
    content: userMessage
  });

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // Fast, free model
        messages: messages,
        temperature: 0.7,
        max_tokens: 150, // Increased to allow for menu item descriptions if needed
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    let aiResponse = response.data?.choices?.[0]?.message?.content || "";

    if (!aiResponse || aiResponse.trim().length < 3) {
      throw new Error("Empty response from AI");
    }

    // Clean up and ensure response is concise (max 300 characters)
    aiResponse = aiResponse.trim();

    // If response is too long, truncate it intelligently
    if (aiResponse.length > 300) {
      const sentences = aiResponse.split(/[.!?]+/);
      aiResponse = sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
      if (aiResponse.length > 300) {
        aiResponse = aiResponse.substring(0, 297) + '...';
      }
    }

    return aiResponse;
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);

    // Provide helpful error messages
    if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo ENOTFOUND')) {
      throw new Error("Cannot connect to Groq API. Please check your internet connection and DNS settings.");
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error("Connection refused by Groq API. The service might be temporarily unavailable.");
    } else if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your GROQ_API_KEY in .env file.");
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }

    throw error;
  }
};


exports.chatReply = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Hi! Please type a message so I can help you. 😊"
      });
    }

    // Use sessionId from request or generate one
    const userSessionId = sessionId || req.ip || "default";
    const conversation = getConversationContext(userSessionId);

    // Add user message to conversation history
    conversation.messages.push({
      sender: "user",
      text: message.trim(),
      timestamp: new Date(),
    });

    // Require Groq API key - no fallback responses
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not configured");
      return res.status(500).json({
        reply: "Error: AI chatbot is not configured. Please set GROQ_API_KEY in your .env file.",
        error: "GROQ_API_KEY_MISSING"
      });
    }

    // Fetch formatted food data
    const foods = await Food.find({ isAvailable: true })
      .select('name price description restaurant')
      .populate('restaurant', 'name')
      .limit(50);

    const foodContext = foods.map(f =>
      `- ${f.name} (${f.restaurant?.name || 'Unknown'}): ₹${f.price}`
    ).join('\n');

    let reply;
    try {
      reply = await getAIResponse(message.trim(), conversation.messages, foodContext);
      console.log("✅ AI Response generated successfully");
    } catch (aiError) {
      console.error("❌ AI Error:", aiError.message);
      console.error("❌ AI Error Details:", aiError.response?.data || aiError.message);
      // Return error to user instead of fallback
      return res.status(500).json({
        reply: `AI Error: ${aiError.message}. Please check your GROQ_API_KEY and try again.`,
        error: "AI_API_ERROR",
        details: aiError.response?.data || aiError.message
      });
    }

    // Add bot response to conversation history
    conversation.messages.push({
      sender: "bot",
      text: reply,
      timestamp: new Date(),
    });

    // Keep only last 20 messages to prevent memory issues
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    res.json({ reply, sessionId: userSessionId });
  } catch (error) {
    console.error("❌ Chatbot error:", error.message);
    console.error("❌ Error stack:", error.stack);

    // Return actual error to user
    return res.status(500).json({
      reply: `Error: ${error.message}. Please check server logs for details.`,
      error: "CHATBOT_ERROR",
      details: error.message
    });
  }
};
