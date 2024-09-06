// routes/chatRoutes.ts

import express from "express";
import { ChatController } from "../controllers/chatController";
import { authenticateUser } from "../middlewares/authentication";
import { checkAgentOrAdminOrClientRole } from "../middlewares/roleChecker";

const router = express.Router();

// Protect all routes with authenticateUser middleware
router.use(authenticateUser);
router.use(checkAgentOrAdminOrClientRole)

// Route to fetch all chats for the authenticated user
router.get("/all", ChatController.fetchAllChats);

// Route to fetch messages for a specific chat
router.get("/:chatId/messages", ChatController.fetchMessages);

// Route to create a new chat
router.post("/create", ChatController.createChat);

// Route to add a message to an existing chat
router.post("/:chatId/messages", ChatController.addMessage);

// Route to update read status for a message
router.patch(
  "/:chatId/messages/:messageId/read",
  ChatController.updateReadStatus
);

export default router;
