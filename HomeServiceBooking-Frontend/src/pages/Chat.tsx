"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { io, type Socket } from "socket.io-client";
import ChatSidebar from "../components/chats/ChatSidebar";
import ChatWindow from "../components/chats/ChatWindow";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";

interface Conversation {
  id: string;
  userId: string;
  requiterId: string;
  user?: { id: string; name: string; userProfileImage: string };
  requiter?: { id: string; name: string; requiterProfileImage: string };
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: "USER" | "REQUITER";
  conversationId: string;
  read: boolean;
  createdAt: string;
}

const Chat = () => {
  const { backendUrl, userToken, userData, requiterData, requiterToken } =
    useContext(AppContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMessageView, setShowMessageView] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Use a ref to track the selected conversation for socket events
  const selectedConversationRef = useRef<string | null>(null);

  const isUser = !!userData;
  const isRequiter = !!requiterData;
  const currentId = isUser ? userData?.id : requiterData?.id;
  const token = isUser ? userToken : requiterToken;

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkMobileView();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobileView);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      if (!token) {
        console.warn("No token available for fetching unread count");
        return;
      }

      const endpoint = isUser
        ? `${backendUrl}/api/chat/user/unread`
        : `${backendUrl}/api/chat/requiter/unread`;

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: token },
      });

      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("API error response:", error.response.data);
      }
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);

      if (!token) {
        console.warn("No token available for fetching conversations");
        setLoading(false);
        return;
      }

      const endpoint = isUser
        ? `${backendUrl}/api/chat/user/conversations`
        : `${backendUrl}/api/chat/requiter/conversations`;

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: token },
      });

      if (data.success) {
        setConversations(data.conversations);

        if (data.conversations.length > 0 && !selectedConversation) {
          const firstConversationId = data.conversations[0].id;
          setSelectedConversation(firstConversationId);
          selectedConversationRef.current = firstConversationId;
          console.log(
            `Setting initial selected conversation to ${firstConversationId}`
          );
        }
      }

      fetchUnreadCount();
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("API error response:", error.response.data);
        toast.error(
          `Failed to load conversations: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        toast.error("Failed to load conversations");
      }
    } finally {
      setLoading(false);
    }
  };

  // Modify the handleSendMessage function to avoid duplicate messages
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    const conversation = conversations.find(
      (c) => c.id === selectedConversation
    );
    if (!conversation) return;

    const receiverId = isUser ? conversation.requiterId : conversation.userId;

    const messageData = {
      conversationId: selectedConversation,
      content: newMessage,
      senderId: currentId,
      senderType: isUser ? "USER" : "REQUITER",
      receiverId,
    };

    socket.emit("send_message", messageData);

    setNewMessage("");
  };

  // Improve the socket event handling
  useEffect(() => {
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      if (token) {
        console.log(
          `Authenticating socket as ${isUser ? "user" : "requiter"} with token`
        );
        newSocket.emit("authenticate", {
          token,
          type: isUser ? "user" : "requiter",
        });
      } else {
        console.warn("No token available for authentication");
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection failed:", error.message, error);
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on("authenticated", () => {
      fetchConversations();
    });

    newSocket.on("auth_error", (error) => {
      console.error("Authentication error:", error);
      toast.error(`Authentication failed: ${error.message}`);
    });

    newSocket.on("new_message", (message: Message) => {
      const currentSelectedConversation = selectedConversationRef.current;

      console.log("Received new_message event:", {
        messageId: message.id,
        conversationId: message.conversationId,
        senderType: message.senderType,
        currentConversation: currentSelectedConversation,
      });

      // Compare with the ref value instead of the state
      if (message.conversationId === currentSelectedConversation) {
        console.log("Adding new message to current conversation");
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark message as read immediately
        newSocket.emit("mark_as_read", {
          messageIds: [message.id],
          conversationId: message.conversationId,
        });

        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === message.id ? { ...msg, read: true } : msg
                ),
              };
            }
            return conv;
          });
        });
      } else {
        setUnreadCount((prev) => prev + 1);

        if (currentSelectedConversation !== message.conversationId) {
          toast.info("New message in another conversation");
        }
      }

      // Update conversations list to show latest message
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === message.conversationId) {
            if (conv.messages.some((m) => m.id === message.id)) {
              return conv;
            }
            return {
              ...conv,
              messages: [message, ...conv.messages],
            };
          }
          return conv;
        });
      });
    });

    newSocket.on("message_sent", (message: Message) => {
      const currentSelectedConversation = selectedConversationRef.current;

      console.log("Received message_sent event:", {
        messageId: message.id,
        conversationId: message.conversationId,
        currentConversation: currentSelectedConversation,
      });

      if (message.conversationId === currentSelectedConversation) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      // Update conversations list to show latest message
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === message.conversationId) {
            if (conv.messages.some((m) => m.id === message.id)) {
              return conv;
            }
            return {
              ...conv,
              messages: [message, ...conv.messages],
            };
          }
          return conv;
        });
      });
    });

    newSocket.on("messages_read", ({ messageIds, conversationId }) => {
      if (selectedConversationRef.current === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, read: true } : msg
          )
        );
      }

      // Update conversations list
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                messageIds.includes(msg.id) ? { ...msg, read: true } : msg
              ),
            };
          }
          return conv;
        });
      });

      // Update unread count
      fetchUnreadCount();
    });

    newSocket.on("unread_count_update", ({ unreadCount: count }) => {
      setUnreadCount(count);
    });

    setSocket(newSocket);

    return () => {
      console.log("Disconnecting socket");
      newSocket.disconnect();
    };
  }, [backendUrl, token, isUser, isRequiter]);

  useEffect(() => {
    if (token) {
      fetchConversations();
    } else {
      console.warn("No token available, skipping initial data fetch");
    }
  }, [token]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (token) {
        fetchUnreadCount();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [token, location.pathname]);

  useEffect(() => {
    if (!selectedConversation || !token) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Use the appropriate endpoint based on user type
        const endpoint = isUser
          ? `${backendUrl}/api/chat/user/conversation/${selectedConversation}/messages`
          : `${backendUrl}/api/chat/requiter/conversation/${selectedConversation}/messages`;

        console.log(
          `Fetching messages for conversation ${selectedConversation} with token: ${
            token ? "Token exists" : "No token"
          }`
        );

        const { data } = await axios.get(endpoint, {
          headers: { Authorization: token },
        });

        if (data.success) {
          setMessages(data.messages);

          if (data.markedAsRead > 0) {
            fetchUnreadCount();

            setConversations((prev) => {
              return prev.map((conv) => {
                if (conv.id === selectedConversation) {
                  return {
                    ...conv,
                    messages: conv.messages.map((msg) => {
                      if (
                        (isUser && msg.senderType === "REQUITER") ||
                        (!isUser && msg.senderType === "USER")
                      ) {
                        return { ...msg, read: true };
                      }
                      return msg;
                    }),
                  };
                }
                return conv;
              });
            });
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error response:", error.response.data);
          toast.error(
            `Failed to load messages: ${
              error.response.data.message || "Unknown error"
            }`
          );
        } else {
          toast.error("Failed to load messages");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [backendUrl, selectedConversation, token, isUser]);

  const handleConversationSelect = (id: string) => {
    console.log(`Selecting conversation: ${id}`);
    setSelectedConversation(id);
    selectedConversationRef.current = id;

    // Mark all unread messages in this conversation as read
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      const unreadMessageIds = conversation.messages
        .filter((msg) => {
          return (
            (isUser && msg.senderType === "REQUITER" && !msg.read) ||
            (!isUser && msg.senderType === "USER" && !msg.read)
          );
        })
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0 && socket) {
        socket.emit("mark_as_read", {
          messageIds: unreadMessageIds,
          conversationId: id,
        });
      }
    }

    if (isMobileView) {
      setShowMessageView(true);
    }
  };

  const handleBackToList = () => {
    setShowMessageView(false);
  };

  const handleConversationRead = (conversationId: string) => {
    console.log(`Conversation ${conversationId} marked as read`);

    fetchUnreadCount();
  };

  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        {showMessageView ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 text-white bg-gradient-to-r from-purple-500 to-indigo-600">
              <button
                onClick={handleBackToList}
                className="flex items-center text-white hover:text-white/80"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Back</span>
              </button>
              <div className="ml-4">
                {conversations.find((c) => c.id === selectedConversation) && (
                  <h2 className="font-semibold">
                    {isUser
                      ? conversations.find((c) => c.id === selectedConversation)
                          ?.requiter?.name
                      : conversations.find((c) => c.id === selectedConversation)
                          ?.user?.name}
                  </h2>
                )}
              </div>
            </div>
            <div className="flex-1">
              <ChatWindow
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                isUser={isUser}
                currentId={currentId || ""}
                loading={loading}
                socket={socket}
                conversationId={selectedConversation || undefined}
              />
            </div>
          </div>
        ) : (
          // Show conversation list
          <div className="h-full">
            <ChatSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={handleConversationSelect}
              isUser={isUser}
              loading={loading}
              isMobile={true}
              socket={socket}
              onConversationRead={handleConversationRead}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop view with side-by-side layout
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="w-1/4 min-w-[300px] h-full">
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={handleConversationSelect}
          isUser={isUser}
          loading={loading}
          isMobile={false}
          socket={socket}
          onConversationRead={handleConversationRead}
        />
      </div>

      <div className="flex-1 h-full">
        {selectedConversation ? (
          <ChatWindow
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isUser={isUser}
            currentId={currentId || ""}
            loading={loading}
            socket={socket}
            conversationId={selectedConversation}
          />
        ) : (
          <div className="flex items-center justify-center flex-1 h-full p-4">
            <p className="p-6 text-gray-500 bg-white rounded-lg shadow-md">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
