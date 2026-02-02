"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import authService from "@/lib/authService";
import chatService from "@/lib/chatService";
import historyService from "@/lib/historyService";
import ChatSidebarNav from "@/components/chat/ChatSidebarNav";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import {
  Message,
  createMessage,
  clearMessagesFromStorage,
  getLastUserMessage,
} from "@/utils/chat";
import { ChatModel, detectModelFromSubdomain } from "@/utils/subdomain";

export default function ChatScreen() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const sessionIdRef = useRef<number | null>(null); // Ref để lưu sessionId ngay lập tức
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("RAG");
  const [isSubdomainModel, setIsSubdomainModel] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0); // Trigger để refresh sidebar

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
      setMessages([]);
    } else {
      setIsGuest(true);
      setMessages([]);
    }
  }, []);

  const handleSendMessage = async (message: string, model: ChatModel) => {
    if (!message.trim()) return;

    console.log("📤 Sending message, sessionIdRef:", sessionIdRef.current);

    const userMessage = createMessage("user", message, model);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Sử dụng ref thay vì state để tránh vấn đề async
      let sessionId = sessionIdRef.current;

      if (!isGuest && !sessionId) {
        console.log("🆕 Creating new session for first message");
        const sessionResponse = await historyService.createSession(
          message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        );

        if (sessionResponse.success && sessionResponse.data) {
          sessionId = sessionResponse.data.id;
          console.log("✅ Session created with ID:", sessionId);
          // Update cả ref và state
          sessionIdRef.current = sessionId;
          setCurrentSessionId(sessionId);
          setCurrentChat(sessionId.toString());
          setSidebarRefreshTrigger((prev) => prev + 1);
        } else {
          // Nếu tạo session thất bại, không tiếp tục
          console.error("❌ Failed to create session:", sessionResponse.error);
          throw new Error("Không thể tạo phiên trò chuyện");
        }
      } else {
        console.log("📝 Using existing session ID:", sessionId);
      }

      const response = await chatService.sendQuestion(message);

      if (response.success && response.data) {
        const aiMessage = createMessage(
          "assistant",
          response.data.answer,
          model,
        );
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        if (!isGuest && sessionId) {
          const saveResult = await historyService.createMessage(
            sessionId,
            message,
            response.data.answer,
          );
          if (saveResult.success) {
            setSidebarRefreshTrigger((prev) => prev + 1);
          }
        }
      } else {
        const errorText = response.error || "Không thể kết nối đến server";
        const errorMessage = createMessage(
          "assistant",
          `Xin lỗi, đã có lỗi xảy ra: ${errorText}`,
          model,
        );
        setMessages([...updatedMessages, errorMessage]);

        if (!isGuest && sessionId) {
          await historyService.createMessage(
            sessionId,
            message,
            `[Error] ${errorText}`,
          );
        }
      }
    } catch (error) {
      const errorMessage = createMessage(
        "assistant",
        "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
        model,
      );
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setCurrentChat(null);
    setCurrentSessionId(null);
    sessionIdRef.current = null; // Reset ref

    if (isGuest) {
      clearMessagesFromStorage();
    }
  };

  const handleSelectChat = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const numericSessionId = parseInt(sessionId);
      const response =
        await historyService.getSessionMessages(numericSessionId);

      if (response.success && response.data) {
        // Convert history messages to Message format
        const loadedMessages: Message[] = [];

        response.data.forEach((historyItem) => {
          // Add user message
          if (historyItem.question) {
            loadedMessages.push(
              createMessage("user", historyItem.question, selectedModel),
            );
          }
          // Add AI response
          if (historyItem.answer) {
            loadedMessages.push(
              createMessage("assistant", historyItem.answer, selectedModel),
            );
          }
        });

        setMessages(loadedMessages);
        setCurrentChat(sessionId);
        setCurrentSessionId(numericSessionId);
        sessionIdRef.current = numericSessionId; // Update ref
      }
    } catch (error) {
      // Error loading messages
    } finally {
      setIsLoading(false);
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
    if (!isSubdomainModel) {
      setSelectedModel(model);
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background - Editorial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />

      {/* Editorial grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glass editorial layer */}
      <div className="absolute inset-0 bg-slate-700/[0.01] backdrop-blur-[0.2px]" />

      {/* Sidebar - Only show when logged in */}
      {!isGuest && (
        <ChatSidebarNav
          user={user}
          isGuest={isGuest}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          currentChat={currentChat}
          refreshTrigger={sidebarRefreshTrigger}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Guest Header - Editorial style */}
        {isGuest && (
          <header className="relative border-b border-slate-200/50 bg-white/40 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-9 h-9 border border-slate-300 group-hover:border-slate-400 transition-colors" />
                  <div className="absolute inset-1.5 bg-slate-100/50" />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-serif font-medium text-slate-700">
                    W
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-serif font-medium text-slate-800 tracking-wide">
                    WikiChatbot
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em]">
                    Trí tuệ nhân tạo
                  </span>
                </div>
              </Link>

              {/* Guest badge & Auth buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    Khách
                  </span>
                </div>
                <Link
                  href="/login"
                  className="text-xs text-slate-600 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-400 pb-px"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-xs px-4 py-2 bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </header>
        )}

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
