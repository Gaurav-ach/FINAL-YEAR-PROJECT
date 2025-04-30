import type { Server, Socket } from "socket.io";
import verifyToken from "../utils/verifyToken";
import { db } from "../lib/prisma";

// Store active connections
const activeUsers = new Map();
const activeRequiters = new Map();

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    socket.on("authenticate", async ({ token, type }) => {
      console.log("Authentication attempt:", {
        tokenExists: !!token,
        type,
        socketId: socket.id,
      });

      if (!token) {
        console.log("No token provided for socket:", socket.id);
        socket.emit("auth_error", { message: "No token provided" });
        return;
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        console.log("Invalid token for socket:", socket.id);
        socket.emit("auth_error", { message: "Invalid token" });
        return;
      }

      console.log("Successfully decoded token for:", {
        id: decoded.id,
        role: decoded.role || "not specified",
        socketId: socket.id,
      });

      const { id } = decoded;

      // For socket connections, we'll use the type parameter to determine if it's a user or requiter
      if (type === "user") {
        // Verify this ID exists in the user table
        const user = await db.user.findUnique({
          where: { id },
        });

        if (!user) {
          console.log(`User with ID ${id} not found in database`);
          socket.emit("auth_error", { message: "User not found" });
          return;
        }

        activeUsers.set(id, socket.id);
        socket.join(`user:${id}`);
        console.log(`User ${id} connected and joined room user:${id}`);

        // Fetch unread count and emit to the user
        try {
          const conversations = await db.conversation.findMany({
            where: { userId: id },
            select: { id: true },
          });

          const conversationIds = conversations.map((c) => c.id);

          const unreadCount = await db.message.count({
            where: {
              conversationId: { in: conversationIds },
              senderType: "REQUITER",
              read: false,
            },
          });

          console.log(`Emitting unread count ${unreadCount} to user ${id}`);
          socket.emit("unread_count_update", { unreadCount });
        } catch (error) {
          console.error("Error fetching unread count for user:", error);
        }
      } else if (type === "requiter") {
        // Verify this ID exists in the requiter table
        const requiter = await db.requiter.findUnique({
          where: { id },
        });

        if (!requiter) {
          console.log(`Requiter with ID ${id} not found in database`);
          socket.emit("auth_error", { message: "Requiter not found" });
          return;
        }

        activeRequiters.set(id, socket.id);
        socket.join(`requiter:${id}`);
        console.log(`Requiter ${id} connected and joined room requiter:${id}`);

        // Fetch unread count and emit to the requiter
        try {
          const conversations = await db.conversation.findMany({
            where: { requiterId: id },
            select: { id: true },
          });

          const conversationIds = conversations.map((c) => c.id);

          const unreadCount = await db.message.count({
            where: {
              conversationId: { in: conversationIds },
              senderType: "USER",
              read: false,
            },
          });

          console.log(`Emitting unread count ${unreadCount} to requiter ${id}`);
          socket.emit("unread_count_update", { unreadCount });
        } catch (error) {
          console.error("Error fetching unread count for requiter:", error);
        }
      }

      socket.emit("authenticated");
      console.log(`Socket ${socket.id} authenticated successfully as ${type}`);
    });

    socket.on("send_message", async (messageData) => {
      try {
        const { conversationId, content, senderId, senderType, receiverId } =
          messageData;

        console.log(
          `Socket: Received send_message event from ${senderType} ${senderId} to ${receiverId}`,
          {
            conversationId,
            contentLength: content.length,
          }
        );

        // Create message in database
        const message = await db.message.create({
          data: {
            content,
            senderId,
            senderType,
            conversationId,
            read: false,
          },
        });

        console.log(`Socket: Created message ${message.id} in database`);

        // Update conversation timestamp
        await db.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        // Emit to sender
        socket.emit("message_sent", message);
        console.log(`Socket: Emitted message_sent to sender ${senderId}`);

        // Emit to receiver
        const receiverRoom =
          senderType === "USER"
            ? `requiter:${receiverId}`
            : `user:${receiverId}`;
        socket.to(receiverRoom).emit("new_message", message);
        console.log(
          `Socket: Emitted new_message to receiver room ${receiverRoom}`
        );

        // Also emit unread count update to receiver
        try {
          const isReceiverUser = senderType === "REQUITER";
          const conversations = await db.conversation.findMany({
            where: isReceiverUser
              ? { userId: receiverId }
              : { requiterId: receiverId },
            select: { id: true },
          });

          const conversationIds = conversations.map((c) => c.id);

          const unreadCount = await db.message.count({
            where: {
              conversationId: { in: conversationIds },
              senderType,
              read: false,
            },
          });

          socket.to(receiverRoom).emit("unread_count_update", { unreadCount });
          console.log(
            `Socket: Emitted unread_count_update (${unreadCount}) to receiver room ${receiverRoom}`
          );
        } catch (error) {
          console.error("Error updating unread count for receiver:", error);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("mark_as_read", async ({ messageIds, conversationId }) => {
      try {
        if (
          !messageIds ||
          !Array.isArray(messageIds) ||
          messageIds.length === 0
        ) {
          console.log("No message IDs provided for marking as read");
          return;
        }

        console.log(`Marking messages as read: ${messageIds.join(", ")}`);

        // Update messages in database
        const result = await db.message.updateMany({
          where: {
            id: {
              in: messageIds,
            },
          },
          data: {
            read: true,
            updatedAt: new Date(), // Update the timestamp to ensure changes are reflected
          },
        });

        console.log(`Updated ${result.count} messages as read`);

        // Get the conversation IDs and sender information for these messages
        const messages = await db.message.findMany({
          where: {
            id: {
              in: messageIds,
            },
          },
          select: {
            conversationId: true,
            senderId: true,
            senderType: true,
          },
        });

        // Get unique conversation IDs
        const uniqueConversations = [
          ...new Set(messages.map((m) => m.conversationId)),
        ];

        // Update each affected conversation's timestamp
        for (const convId of uniqueConversations) {
          await db.conversation.update({
            where: {
              id: convId,
            },
            data: {
              updatedAt: new Date(),
            },
          });

          // Get conversation details to find the other participant
          const conversation = await db.conversation.findUnique({
            where: { id: convId },
            select: { userId: true, requiterId: true },
          });

          if (conversation) {
            // Find unique senders to notify them their messages were read
            const uniqueSenders = [
              ...new Set(
                messages
                  .filter((m) => m.conversationId === convId)
                  .map((m) => ({ id: m.senderId, type: m.senderType }))
              ),
            ];

            for (const sender of uniqueSenders) {
              const senderRoom =
                sender.type === "USER"
                  ? `user:${sender.id}`
                  : `requiter:${sender.id}`;
              socket
                .to(senderRoom)
                .emit("messages_read", { messageIds, conversationId: convId });
            }
          }
        }

        // Broadcast to all clients that these messages have been read
        io.emit("messages_read", {
          messageIds,
          conversationId: conversationId || uniqueConversations[0],
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      try {
        // Find the conversation to get the other participant
        db.conversation
          .findUnique({
            where: { id: conversationId },
            select: { userId: true, requiterId: true },
          })
          .then((conversation) => {
            if (!conversation) return;

            // Determine the recipient
            const recipientId =
              userId === conversation.userId
                ? conversation.requiterId
                : conversation.userId;
            const recipientType =
              userId === conversation.userId ? "requiter" : "user";
            const recipientRoom = `${recipientType}:${recipientId}`;

            // Emit typing status to the recipient
            socket.to(recipientRoom).emit("typing_status", {
              conversationId,
              userId,
              isTyping,
            });
          });
      } catch (error) {
        console.error("Error handling typing event:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove from active connections
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }

      for (const [requiterId, socketId] of activeRequiters.entries()) {
        if (socketId === socket.id) {
          activeRequiters.delete(requiterId);
          console.log(`Requiter ${requiterId} disconnected`);
          break;
        }
      }
    });
  });
};
