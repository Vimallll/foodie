const axios = require("axios");

exports.chatReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
      {
        inputs: `You are a helpful food delivery assistant.
Reply shortly and clearly.

User: ${message}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.[0]?.generated_text ||
      "Sorry, I could not generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error.response?.data || error.message);

    res.status(500).json({
      reply: "Server error. Try again later.",
    });
  }
};
