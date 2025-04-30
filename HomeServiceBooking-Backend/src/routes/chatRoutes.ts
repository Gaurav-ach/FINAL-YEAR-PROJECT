import express from "express";
import { UserAuthMiddleware } from "../middleware/userAuthMiddleware";
import { requiterAuthMiddleware } from "../middleware/requiterAuthMiddleware";
import {
  getConversationMessages,
  getOrCreateConversation,
  getRequiterConversations,
  getUnreadMessageCount,
  getUserConversations,
  markMessagesAsRead,
  getUnreadConversations,
  sendMessage,
  deleteMessage,
} from "../controller/chatController";

const router = express.Router();
// Routes accessible by users
router.get("/user/conversations", UserAuthMiddleware, getUserConversations);
router.get("/user/unread", UserAuthMiddleware, getUnreadMessageCount);
router.get(
  "/user/unread-conversations",
  UserAuthMiddleware,
  getUnreadConversations
);
router.get(
  "/user/conversation/:conversationId/messages",
  UserAuthMiddleware,
  getConversationMessages
);
router.post("/user/mark-as-read", UserAuthMiddleware, markMessagesAsRead);
router.post("/user/send", UserAuthMiddleware, sendMessage);
router.delete("/user/message/:messageId", UserAuthMiddleware, deleteMessage);
router.post("/user/conversation", UserAuthMiddleware, getOrCreateConversation);

// Routes accessible by requiters
router.get(
  "/requiter/conversations",
  requiterAuthMiddleware,
  getRequiterConversations
);
router.get("/requiter/unread", requiterAuthMiddleware, getUnreadMessageCount);
router.get(
  "/requiter/unread-conversations",
  requiterAuthMiddleware,
  getUnreadConversations
);
router.get(
  "/requiter/conversation/:conversationId/messages",
  requiterAuthMiddleware,
  getConversationMessages
);
router.post(
  "/requiter/mark-as-read",
  requiterAuthMiddleware,
  markMessagesAsRead
);
router.post("/requiter/send", requiterAuthMiddleware, sendMessage);
router.delete(
  "/requiter/message/:messageId",
  requiterAuthMiddleware,
  deleteMessage
);
router.post(
  "/requiter/conversation",
  requiterAuthMiddleware,
  getOrCreateConversation
);

// Keep these for backward compatibility, but they'll be deprecated
router.post("/conversation", UserAuthMiddleware, getOrCreateConversation);
router.get(
  "/conversation/:conversationId/messages",
  UserAuthMiddleware,
  getConversationMessages
);
router.post("/mark-as-read", UserAuthMiddleware, markMessagesAsRead);
router.post("/send", UserAuthMiddleware, sendMessage);
router.delete("/message/:messageId", UserAuthMiddleware, deleteMessage);

export default router;
