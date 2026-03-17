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

const CHAT_SIDEBAR_VISIBILITY_KEY = "chatSidebarVisibleDesktop";

export default function ChatScreen() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null); // Session UUID for history service
  const [currentQuestionSessionId, setCurrentQuestionSessionId] = useState<
    string | null
  >(null);
  const questionSessionIdRef = useRef<string | null>(null); // Session ID string for Question API
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("RAG");
  const [isSubdomainModel, setIsSubdomainModel] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [prefillMessage, setPrefillMessage] = useState<string | null>(null);
  const [prefillNonce, setPrefillNonce] = useState(0);
  const [optimisticConversation, setOptimisticConversation] = useState<{
    id: string;
    title: string;
    timestamp: Date;
  } | null>(null);

  // Detect subdomain and set model accordingly
  useEffect(() => {
    const { model, isSubdomainModel: isSubdomain } = detectModelFromSubdomain();
    setSelectedModel(model);
    setIsSubdomainModel(isSubdomain);
  }, []);

  // Check authentication and load messages
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const hasToken = authService.isAuthenticated();

    if (currentUser || hasToken) {
      setUser(
        currentUser || {
          username: "Người dùng",
          fullName: null,
          email: "",
          role: "user",
        },
      );
      setIsGuest(false);
      setMessages([]);
    } else {
      setIsGuest(true);
      setMessages([]);
    }
  }, []);

  // Load sidebar visibility preference once.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(CHAT_SIDEBAR_VISIBILITY_KEY);
    if (saved === null) return;
    setIsDesktopSidebarVisible(saved !== "false");
  }, []);

  // Persist sidebar visibility preference for authenticated chat layout.
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      CHAT_SIDEBAR_VISIBILITY_KEY,
      String(isDesktopSidebarVisible),
    );
  }, [isDesktopSidebarVisible]);

  const handleSendMessage = async (message: string, model: ChatModel) => {
    if (!message.trim()) return;

    console.log("📤 Sending message, historySessionId:", sessionIdRef.current);
    console.log(
      "📤 Sending message, questionSessionId:",
      questionSessionIdRef.current,
    );

    const userMessage = createMessage("user", message, model);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Use question sessionId only when continuing an existing flow.
      let historySessionId = sessionIdRef.current;
      let questionSessionId = questionSessionIdRef.current;

      if (!isGuest && !historySessionId) {
        const optimisticId = `temp-${Date.now()}`;
        const optimisticTitle =
          message.slice(0, 50) + (message.length > 50 ? "..." : "");
        setOptimisticConversation({
          id: optimisticId,
          title: optimisticTitle,
          timestamp: new Date(),
        });
        setCurrentChat(optimisticId);
      }

      const response = await chatService.sendQuestion(message, {
        sessionId: questionSessionId || undefined,
      });

      if (response.success && response.data) {
        if (response.data.sessionId) {
          questionSessionId = response.data.sessionId;
          questionSessionIdRef.current = response.data.sessionId;
          setCurrentQuestionSessionId(response.data.sessionId);
        }

        const aiMessage = createMessage(
          "assistant",
          response.data.answer,
          model,
        );
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // Refresh history list immediately after backend returns an answer.
        if (!isGuest) {
          setSidebarRefreshTrigger((prev) => prev + 1);
        }

        if (!isGuest && !historySessionId) {
          const fallbackTitle =
            message.slice(0, 50) + (message.length > 50 ? "..." : "");

          const sessionResponse = await historyService.createSession(
            fallbackTitle,
            questionSessionId || undefined,
          );

          if (sessionResponse.success && sessionResponse.data) {
            historySessionId = sessionResponse.data.sessionId;
            sessionIdRef.current = historySessionId;
            setCurrentSessionId(historySessionId);
            setCurrentChat(historySessionId);
            // Keep optimistic row with the real sessionId so sidebar does not
            // flicker empty when list API is eventually consistent.
            setOptimisticConversation({
              id: historySessionId,
              title: sessionResponse.data.sessionName || fallbackTitle,
              timestamp: new Date(),
            });
            setSidebarRefreshTrigger((prev) => prev + 1);

            if (!questionSessionId && sessionResponse.data.sessionId) {
              questionSessionId = sessionResponse.data.sessionId;
              questionSessionIdRef.current = sessionResponse.data.sessionId;
              setCurrentQuestionSessionId(sessionResponse.data.sessionId);
            }
          } else if (questionSessionId) {
            // Fallback: Question API may have already created the session.
            const existingSession =
              await historyService.getSession(questionSessionId);

            if (existingSession.success && existingSession.data) {
              historySessionId = existingSession.data.sessionId;
              sessionIdRef.current = historySessionId;
              setCurrentSessionId(historySessionId);
              setCurrentChat(historySessionId);
              setOptimisticConversation({
                id: historySessionId,
                title: existingSession.data.sessionName || fallbackTitle,
                timestamp: new Date(),
              });
              setSidebarRefreshTrigger((prev) => prev + 1);
            }
          }
        }

        if (!isGuest && historySessionId) {
          const saveResult = await historyService.createMessage(
            historySessionId,
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

        if (!isGuest && !historySessionId) {
          setOptimisticConversation(null);
          setCurrentChat(null);
        }

        if (!isGuest && historySessionId) {
          await historyService.createMessage(
            historySessionId,
            message,
            `[Error] ${errorText}`,
          );
        }
      }
    } catch (error) {
      setOptimisticConversation(null);
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
    setCurrentQuestionSessionId(null);
    setOptimisticConversation(null);
    sessionIdRef.current = null; // Reset ref
    questionSessionIdRef.current = null;

    if (isGuest) {
      clearMessagesFromStorage();
    }
  };

  const handleSelectChat = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setOptimisticConversation(null);
      const [messagesResponse, sessionResponse] = await Promise.all([
        historyService.getSessionMessages(sessionId),
        historyService.getSession(sessionId),
      ]);

      if (messagesResponse.success && messagesResponse.data) {
        // Convert history messages to Message format
        const loadedMessages: Message[] = [];

        messagesResponse.data.forEach((historyItem) => {
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
        setCurrentSessionId(sessionId);
        sessionIdRef.current = sessionId; // Update ref

        const selectedQuestionSessionId =
          sessionResponse.success && sessionResponse.data?.sessionId
            ? sessionResponse.data.sessionId
            : null;

        setCurrentQuestionSessionId(selectedQuestionSessionId);
        questionSessionIdRef.current = selectedQuestionSessionId;
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

  const handleSuggestionClick = (question: string) => {
    if (isLoading) return;
    setPrefillMessage(question);
    setPrefillNonce((prev) => prev + 1);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarVisible((prev) => !prev);
  };

  const shouldRenderSidebar = !isGuest;
  const isSidebarCollapsed = !isDesktopSidebarVisible && !isMobileSidebarOpen;

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
      <div className="absolute inset-0 bg-slate-700/1 backdrop-blur-[0.2px]" />

      {/* Sidebar - Only show when logged in */}
      {shouldRenderSidebar && (
        <>
          {/* Mobile sidebar overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          {/* Sidebar wrapper - drawer on mobile, static on desktop */}
          <div
            className={`fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ChatSidebarNav
              user={user}
              isGuest={isGuest}
              onNewChat={() => {
                handleNewChat();
                setIsMobileSidebarOpen(false);
              }}
              onSelectChat={(id) => {
                handleSelectChat(id);
                setIsMobileSidebarOpen(false);
              }}
              currentChat={currentChat}
              refreshTrigger={sidebarRefreshTrigger}
              optimisticConversation={optimisticConversation}
              collapsed={isSidebarCollapsed}
              onToggleSidebar={toggleDesktopSidebar}
            />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Guest Header - Editorial style */}
        {isGuest && (
          <header className="relative border-b border-slate-200/50 bg-white/40 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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
                    WikichatbotAI
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em]">
                    Hỏi đáp về danh nhân
                  </span>
                </div>
              </Link>

              {/* Guest badge & Auth buttons */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-100/50 border border-slate-200">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    Khách
                  </span>
                </div>
                <Link
                  href="/login"
                  className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-400 pb-px hidden sm:inline"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Mobile header with hamburger for logged-in users */}
        {!isGuest && (
          <header className="relative border-b border-slate-200/50 bg-white/40 backdrop-blur-sm md:hidden">
            <div className="px-3 py-3 flex items-center justify-between">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-medium text-slate-700">
                  WikichatbotAI
                </span>
              </div>
              <button
                onClick={handleNewChat}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </header>
        )}

        {/* Chat Messages */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onRegenerate={handleRegenerateResponse}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          isSubdomainModel={isSubdomainModel}
          prefillMessage={prefillMessage}
          prefillNonce={prefillNonce}
        />
      </div>
    </div>
  );
}
