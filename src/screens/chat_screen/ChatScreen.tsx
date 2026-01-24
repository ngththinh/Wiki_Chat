"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import ChatSidebarNav from "@/components/chat/ChatSidebarNav";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import GuestHeader from "@/components/chat/GuestHeader";
import { TIMING } from "@/constants";
import {
  Message,
  createMessage,
  loadMessagesFromStorage,
  saveMessagesToStorage,
  clearMessagesFromStorage,
  getLastUserMessage,
} from "@/utils/chat";
import { ChatModel, detectModelFromSubdomain } from "@/utils/subdomain";

export default function ChatScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("RAG");
  const [isSubdomainModel, setIsSubdomainModel] = useState(false);

  // Detect subdomain and set model accordingly
  useEffect(() => {
    const { model, isSubdomainModel: isSubdomain } = detectModelFromSubdomain();
    setSelectedModel(model);
    setIsSubdomainModel(isSubdomain);
  }, []);

  // Check authentication and load messages
  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
      setIsGuest(false);
      // When logged in, start with empty messages
      setMessages([]);
      // TODO: Load chat history from backend for logged-in user
    } else {
      setIsGuest(true);
      // Guest mode: start fresh, no localStorage persistence
      setMessages([]);
    }
  }, []);

  const handleSendMessage = async (message: string, model: ChatModel) => {
    if (!message.trim()) return;

    const userMessage = createMessage("user", message, model);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Guest messages are not saved to localStorage (memory only)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = `Đây là phản hồi mô phỏng sử dụng mô hình ${model} cho câu hỏi: "${message}". Trong thực tế, đây sẽ là câu trả lời thực từ AI về các danh nhân Việt Nam.`;
      const aiMessage = createMessage("assistant", aiResponse, model);
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      setIsLoading(false);

      // Guest messages stay in memory only
      // TODO: Save to backend for logged-in user
    }, TIMING.AI_RESPONSE_DELAY);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChat(null);

    if (isGuest) {
      clearMessagesFromStorage();
    }
  };

  const handleRegenerateResponse = () => {
    if (messages.length === 0) return;

    const lastUserMessage = getLastUserMessage(messages);
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      handleSendMessage(lastUserMessage.content, selectedModel);
    }
  };

  const handleModelChange = (model: ChatModel) => {
    // Only allow model change if not using subdomain routing
    if (!isSubdomainModel) {
      setSelectedModel(model);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Only show when logged in */}
      {!isGuest && (
        <ChatSidebarNav
          user={user}
          isGuest={isGuest}
          onNewChat={handleNewChat}
          currentChat={currentChat}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Guest Header - Only show when guest */}
        {isGuest && <GuestHeader />}

        {/* Chat Messages */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onRegenerate={handleRegenerateResponse}
        />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          isSubdomainModel={isSubdomainModel}
        />
      </div>
    </div>
  );
}
