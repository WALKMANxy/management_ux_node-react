// routes/chatRoutes.ts

import express from "express";
import { ChatController } from "../controllers/chatController";
import { authenticateUser } from "../middlewares/authentication";
import { checkAllowedRole } from "../middlewares/roleChecker";

const router = express.Router();

// Protect all routes with authenticateUser middleware
router.use(authenticateUser);
router.use(checkAllowedRole);

// Route to fetch all chats for the authenticated user
router.get("/", ChatController.fetchAllChats);

// Route to fetch a specific chat by its ID
router.get("/:chatId", ChatController.fetchChatById);

// Route to fetch messages for a specific chat
router.get("/:chatId/messages", ChatController.fetchMessages);

router.get("/:chatId/older-messages", ChatController.fetchOlderMessages);

// Route to fetch messages for multiple chats
router.post("/messages", ChatController.fetchMessagesFromMultipleChats);

// Route to create a new chat
router.post("/create", ChatController.createChat);

// Route to add a message to an existing chat
router.post("/:chatId/messages", ChatController.addMessage);

// Route to update read status for multiple messages in a chat
router.patch("/:chatId/messages/read", ChatController.updateReadStatus); // Adjusted to match new controller behavior

export default router;
