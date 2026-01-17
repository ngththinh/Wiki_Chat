"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import ChatSidebarNav from "@/components/chat/ChatSidebarNav";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput, { ChatModel } from "@/components/chat/ChatInput";

export default function ChatScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("RAG");

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleSendMessage = async (message: string, model: ChatModel) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
      model: model,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response using ${model} model to: "${message}". In production, this would be replaced with actual AI responses about entrepreneurs and business insights.`,
        timestamp: new Date(),
        model: model,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChat(null);
  };

  const handleRegenerateResponse = () => {
    if (messages.length === 0) return;

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    if (lastUserMessage) {
      // Remove last AI response
      setMessages((prev) => prev.slice(0, -1));
      // Regenerate
      handleSendMessage(lastUserMessage.content, selectedModel);
    }
  };

  const handleModelChange = (model: ChatModel) => {
    setSelectedModel(model);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebarNav
        user={user}
        onNewChat={handleNewChat}
        currentChat={currentChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
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
        />
      </div>
    </div>
  );
}
