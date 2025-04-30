import { Skeleton } from "../ui/skeleton";
import { Search, X } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: "USER" | "REQUITER";
  read: boolean;
  conversationId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  user?: {
    name: string;
    userProfileImage: string;
  };
  requiter?: {
    name: string;
    requiterProfileImage: string;
  };
  messages: Message[];
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  isUser: boolean;
  loading: boolean;
  isMobile?: boolean;
  socket: any;
  onConversationRead?: (conversationId: string) => void;
}

const ChatSidebar = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  isUser,
  loading,
  isMobile = false,
  socket,
  onConversationRead,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unreadByConversation, setUnreadByConversation] = useState<
    Record<string, number>
  >({});
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
  const { backendUrl, userToken, requiterToken } = useContext(AppContext);

  // Listen for typing status updates
  useEffect(() => {
    if (!socket) return;

    const handleTypingStatus = ({
      conversationId,
      isTyping,
    }: {
      conversationId: string;
      isTyping: boolean;
    }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [conversationId]: isTyping,
      }));

      if (isTyping) {
        setTimeout(() => {
          setTypingStatus((prev) => ({
            ...prev,
            [conversationId]: false,
          }));
        }, 3000);
      }
    };

    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("typing_status", handleTypingStatus);
    };
  }, [socket]);

  // Calculate unread messages for each conversation
  useEffect(() => {
    const unreadCounts: Record<string, number> = {};

    conversations.forEach((conversation) => {
      const unreadMessages = conversation.messages.filter((msg) => {
        if (isUser) {
          return msg.senderType === "REQUITER" && !msg.read;
        } else {
          return msg.senderType === "USER" && !msg.read;
        }
      });

      if (unreadMessages.length > 0) {
        unreadCounts[conversation.id] = unreadMessages.length;
      }
    });

    setUnreadByConversation(unreadCounts);
  }, [conversations, isUser]);

  // Mark messages as read when a conversation is selected
  const handleConversationSelect = async (id: string) => {
    setSelectedConversation(id);

    // Find the conversation
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;

    // Get unread message IDs
    const unreadMessageIds = conversation.messages
      .filter((msg) => {
        if (isUser) {
          return msg.senderType === "REQUITER" && !msg.read;
        } else {
          return msg.senderType === "USER" && !msg.read;
        }
      })
      .map((msg) => msg.id);

    // If there are unread messages, mark them as read
    if (unreadMessageIds.length > 0) {
      console.log(
        `Marking ${unreadMessageIds.length} messages as read in conversation ${id}`
      );

      // Update UI immediately
      setUnreadByConversation((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      if (onConversationRead) {
        onConversationRead(id);
      }

      if (socket) {
        socket.emit("mark_as_read", {
          messageIds: unreadMessageIds,
          conversationId: id,
        });
      }

      try {
        const token = isUser ? userToken : requiterToken;
        const endpoint = isUser
          ? `${backendUrl}/api/chat/user/mark-as-read`
          : `${backendUrl}/api/chat/requiter/mark-as-read`;

        console.log(
          "Using token for mark-as-read:",
          token ? "Token exists" : "No token"
        );

        const response = await axios.post(
          endpoint,
          { messageIds: unreadMessageIds },
          { headers: { Authorization: token } }
        );
        console.log("Mark as read API response:", response.data);
      } catch (error) {
        console.error("Error marking messages as read:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error response:", error.response.data);
        }
      }
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter((conversation) => {
        const name = isUser
          ? conversation.requiter?.name
          : conversation.user?.name;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full bg-white border-r border-gray-200">
        <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600">
          <h2 className="text-xl font-bold text-white">Messages</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 mb-3 p-3 ${
                isMobile ? "p-4" : "p-3"
              } bg-gray-50 rounded-lg`}
            >
              <Skeleton
                className={`${
                  isMobile ? "w-14 h-14" : "w-10 h-10"
                } rounded-full`}
              />
              <div className="flex-1">
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-gradient-to-r from-purple-500 to-indigo-600">
        {showSearch ? (
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full p-2 pr-10 text-white border-none rounded-full pl-9 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSearch(false)}
              className="ml-3 font-medium text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-white rounded-full hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 p-3 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="p-6 text-center rounded-lg shadow-sm bg-gray-50">
              <p className="text-lg text-gray-500">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-400">
                  Try a different search term
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              const name = isUser
                ? conversation.requiter?.name
                : conversation.user?.name;
              const image = isUser
                ? conversation.requiter?.requiterProfileImage
                : conversation.user?.userProfileImage;
              const lastMessage =
                conversation.messages[0]?.content || "No messages yet";
              const hasUnread = unreadByConversation[conversation.id] > 0;
              const unreadCount = unreadByConversation[conversation.id] || 0;
              const isTyping = typingStatus[conversation.id] || false;

              return (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 ${
                    isMobile ? "p-4 mb-3" : "p-3 mb-2"
                  } rounded-lg cursor-pointer transition-all duration-200 ${
                    hasUnread ? "bg-blue-50" : ""
                  } ${
                    selectedConversation === conversation.id
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 shadow-md"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="relative">
                    {image ? (
                      <img
                        src={image || "/placeholder.svg"}
                        alt={name || "User"}
                        className={`object-cover ${
                          isMobile ? "w-14 h-14" : "w-12 h-12"
                        } rounded-full border-2 border-white shadow-sm`}
                      />
                    ) : (
                      <div
                        className={`flex items-center justify-center ${
                          isMobile ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg"
                        } font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-sm`}
                      >
                        {name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 ${
                        isMobile ? "w-4 h-4" : "w-3 h-3"
                      } ${
                        isTyping ? "bg-green-500 animate-pulse" : "bg-green-500"
                      } border-2 border-white rounded-full`}
                    ></span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-medium ${
                          isMobile ? "text-lg" : "text-base"
                        } truncate ${hasUnread ? "font-bold text-black" : ""} ${
                          selectedConversation === conversation.id
                            ? "text-purple-700"
                            : "text-gray-800"
                        }`}
                      >
                        {name || "Unknown User"}
                      </h3>
                      {hasUnread && (
                        <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-gray-500 truncate ${
                        hasUnread ? "font-semibold text-black" : ""
                      }`}
                    >
                      {isTyping ? (
                        <span className="italic text-green-600">Typing...</span>
                      ) : (
                        lastMessage
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
