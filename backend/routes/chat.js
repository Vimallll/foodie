const express = require("express");
const router = express.Router();
const { chatReply } = require("../controllers/chatController");

// POST /api/chat
router.post("/", chatReply);

module.exports = router;
