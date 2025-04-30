"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: "USER" | "REQUITER";
  read: boolean;
  createdAt: string;
}

interface ChatWindowProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isUser: boolean;
  currentId: string;
  loading: boolean;
  socket?: any;
  conversationId?: string;
}

const ChatWindow = ({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  isUser,
  currentId,
  loading,
  socket,
  conversationId,
}: ChatWindowProps) => {
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when messages changes
  useEffect(() => {
    scrollToBottom();

    if (messages.length > 0 && socket && conversationId) {
      const unreadMessageIds = messages
        .filter((msg) => {
          return (
            (isUser && msg.senderType === "REQUITER" && !msg.read) ||
            (!isUser && msg.senderType === "USER" && !msg.read)
          );
        })
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        console.log(
          `Auto-marking ${unreadMessageIds.length} visible messages as read`
        );
        socket.emit("mark_as_read", {
          messageIds: unreadMessageIds,
          conversationId,
        });
      }
    }

    setPrevMessagesLength(messages.length);
  }, [messages, conversationId, socket, isUser]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleTypingStatus = ({
      conversationId: convId,
      isTyping: typing,
    }: {
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (convId === conversationId) {
        setIsTyping(typing);
      }
    };

    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("typing_status", handleTypingStatus);
    };
  }, [socket, conversationId]);

  // Function to format timestamp
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Handle input change and emit typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && conversationId) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing status
      socket.emit("typing", {
        conversationId,
        userId: currentId,
        isTyping: true,
      });

      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          conversationId,
          userId: currentId,
          isTyping: false,
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 h-full bg-white">
        <div className="hidden p-4 border-b border-gray-200 md:block">
          <Skeleton className="w-1/4 h-6" />
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`flex mb-4 ${index % 2 === 0 ? "justify-end" : ""}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  index % 2 === 0 ? "bg-primary text-white" : "bg-gray-100"
                }`}
              >
                <Skeleton
                  className={`h-4 w-full ${
                    index % 2 === 0 ? "bg-white/20" : ""
                  }`}
                />
                <Skeleton
                  className={`h-4 w-2/3 mt-2 ${
                    index % 2 === 0 ? "bg-white/20" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-white">
      {/* Chat Header - Only visible on desktop */}
      <div className="hidden p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 md:block">
        <h2 className="text-xl font-semibold text-white">Messages</h2>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="p-6 text-gray-500 bg-white rounded-lg shadow-md">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser =
                (isUser && message.senderType === "USER") ||
                (!isUser && message.senderType === "REQUITER");

              // Special styling for system messages
              const isSystemMessage = message.senderId === "system";

              if (isSystemMessage) {
                return (
                  <div key={message.id} className="flex justify-center mb-4">
                    <div className="bg-gray-100 text-gray-600 p-2 rounded-lg text-sm max-w-[80%] text-center shadow-sm">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-tr-none"
                        : "bg-white rounded-tl-none border border-gray-200"
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <div
                      className={`text-xs mt-1 text-right flex justify-end items-center gap-1 ${
                        isCurrentUser ? "text-white/70" : "text-gray-500"
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {isCurrentUser && message.read && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg shadow-sm max-w-[70%]">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 p-2 rounded-full shadow-sm bg-gray-50">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-transparent border-none focus:outline-none focus:ring-0"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
