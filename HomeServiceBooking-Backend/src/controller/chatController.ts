import type { Request, Response } from "express";
import { db } from "../lib/prisma";

interface AuthenticatedRequest extends Request {
  user?: any;
  requiter?: any;
}

// Get conversations for a user
export const getUserConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const conversations = await db.conversation.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userProfileImage: true,
          },
        },
        requiter: {
          select: {
            id: true,
            name: true,
            requiterProfileImage: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error getting user conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get conversations for a requiter
export const getRequiterConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter.id;

    const conversations = await db.conversation.findMany({
      where: {
        requiterId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userProfileImage: true,
          },
        },
        requiter: {
          select: {
            id: true,
            name: true,
            requiterProfileImage: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error getting requiter conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get or create a conversation between a user and a requiter
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId, requiterId } = req.body;

    if (!userId || !requiterId) {
      res.status(400).json({
        success: false,
        message: "User ID and Requiter ID are required",
      });
      return;
    }

    // Check if conversation already exists
    let conversation = await db.conversation.findFirst({
      where: {
        userId,
        requiterId,
      },
    });

    // If not, create a new conversation
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          userId,
          requiterId,
        },
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error getting or creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get messages for a conversation
export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const isUser = !!req.user;
    const isRequiter = !!req.requiter;
    const currentId = isUser ? req.user.id : req.requiter.id;

    console.log(
      `Fetching messages for conversation ${conversationId} by ${
        isUser ? "user" : "requiter"
      } ${currentId}`
    );

    // Verify the user/requiter has access to this conversation
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      console.log(`Conversation ${conversationId} not found`);
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    // Check if the user/requiter is part of this conversation
    if (isUser && conversation.userId !== currentId) {
      console.log(
        `User ${currentId} doesn't have access to conversation ${conversationId}`
      );
      res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
      return;
    }

    if (!isUser && conversation.requiterId !== currentId) {
      console.log(
        `Requiter ${currentId} doesn't have access to conversation ${conversationId}`
      );
      res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
      return;
    }

    // Get messages
    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(
      `Found ${messages.length} messages in conversation ${conversationId}`
    );

    // Mark unread messages as read
    const unreadMessageIds = messages
      .filter((msg) => {
        if (isUser) {
          return msg.senderType === "REQUITER" && !msg.read;
        } else {
          return msg.senderType === "USER" && !msg.read;
        }
      })
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      console.log(
        `Auto-marking ${unreadMessageIds.length} messages as read when fetching conversation ${conversationId}`
      );

      await db.message.updateMany({
        where: {
          id: {
            in: unreadMessageIds,
          },
        },
        data: {
          read: true,
          updatedAt: new Date(), // Update the timestamp to ensure changes are reflected
        },
      });

      // Update conversation timestamp
      await db.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      messages,
      markedAsRead: unreadMessageIds.length,
    });
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get unread message count
export const getUnreadMessageCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const isUser = !!req.user;
    const currentId = isUser ? req.user.id : req.requiter.id;

    // Get conversations where the current user/requiter is a participant
    const conversations = await db.conversation.findMany({
      where: isUser ? { userId: currentId } : { requiterId: currentId },
      select: {
        id: true,
      },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages
    const unreadCount = await db.message.count({
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderType: isUser ? "REQUITER" : "USER",
        read: false,
      },
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread message count:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Valid message IDs are required",
      });
      return;
    }

    console.log(`API: Marking messages as read: ${messageIds.join(", ")}`);

    // Update messages
    const result = await db.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });

    console.log(`API: Updated ${result.count} messages as read`);

    // Get the conversation IDs for these messages
    const messages = await db.message.findMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      select: {
        conversationId: true,
      },
      distinct: ["conversationId"],
    });

    // Update each affected conversation's timestamp
    for (const message of messages) {
      await db.conversation.update({
        where: {
          id: message.conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      count: result.count,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get unread conversations
export const getUnreadConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const isUser = !!req.user;
    const currentId = isUser ? req.user.id : req.requiter.id;

    // Get conversations where the current user/requiter is a participant
    const conversations = await db.conversation.findMany({
      where: isUser ? { userId: currentId } : { requiterId: currentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userProfileImage: true,
          },
        },
        requiter: {
          select: {
            id: true,
            name: true,
            requiterProfileImage: true,
          },
        },
        messages: {
          where: {
            senderType: isUser ? "REQUITER" : "USER", // Messages from the other party
            read: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Filter to only include conversations with unread messages
    const unreadConversations = conversations.filter(
      (conv) => conv.messages.length > 0
    );

    res.status(200).json({
      success: true,
      unreadConversations,
    });
  } catch (error) {
    console.error("Error getting unread conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const isUser = !!req.user;
    const senderId = isUser ? req.user.id : req.requiter.id;
    const senderType = isUser ? "USER" : "REQUITER";

    if (!conversationId || !content) {
      res.status(400).json({
        success: false,
        message: "Conversation ID and content are required",
      });
      return;
    }

    // Verify the conversation exists and the user/requiter has access
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    // Check if the user/requiter is part of this conversation
    if (isUser && conversation.userId !== senderId) {
      res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
      return;
    }

    if (!isUser && conversation.requiterId !== senderId) {
      res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
      return;
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        senderId,
        senderType,
        conversationId,
        read: false,
      },
    });

    // Update conversation timestamp
    await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete a message
export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { messageId } = req.params;
    const isUser = !!req.user;
    const currentId = isUser ? req.user.id : req.requiter.id;

    // Find the message
    const message = await db.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found",
      });
      return;
    }

    // Check if the user/requiter is the sender of the message
    if (message.senderId !== currentId) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
      return;
    }

    // Delete the message
    await db.message.delete({
      where: {
        id: messageId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
