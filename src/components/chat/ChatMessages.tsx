"use client";

import { SUGGESTION_CARDS } from "@/constants";
import { Message } from "@/utils/chat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate: () => void;
  onSuggestionClick: (question: string) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  onRegenerate,
  onSuggestionClick,
}: ChatMessagesProps) {
  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const showRegenerateButton =
    hasMessages && lastMessage?.role === "assistant" && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center">
            {/* Editorial Welcome Icon */}
            <div className="relative mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border border-slate-300 rounded-2xl"></div>
              <div className="absolute inset-1.5 sm:inset-2 bg-slate-100/50 backdrop-blur-sm rounded-xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
            </div>

            {/* Editorial Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-px bg-slate-300"></div>
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
                Bắt đầu cuộc trò chuyện
              </span>
              <div className="w-12 h-px bg-slate-300"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 mb-3">
              Chào mừng đến với WikichatbotAI
            </h2>
            <p className="text-slate-500 max-w-2xl mb-8 sm:mb-10 text-sm leading-relaxed px-2">
              WikichatbotAI là một chatbot AI để tìm kiếm thông tin, giải đáp
              các câu hỏi về danh nhân Việt Nam và trên thế giới.
            </p>

            {/* Suggestion Cards - Editorial style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
              {SUGGESTION_CARDS.map((card, index) => (
                <SuggestionCard
                  key={index}
                  icon={card.icon}
                  text={card.text}
                  disabled={isLoading}
                  onClick={() => onSuggestionClick(card.text)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading Indicator - Editorial style */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-10 h-10 border border-slate-300 rounded-xl"></div>
                <div className="absolute inset-1.5 bg-slate-100/50 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-serif text-slate-600">AI</span>
                </div>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-sm border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regenerate Button - Editorial style */}
        {showRegenerateButton && (
          <div className="flex justify-center mt-8">
            <button
              onClick={onRegenerate}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-sm border border-slate-300 text-slate-600 hover:bg-white hover:border-slate-400 transition-all text-sm rounded-xl shadow-sm"
            >
              <svg
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <span className="tracking-wide">Tạo lại phản hồi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Suggestion Card Component - Editorial style
function SuggestionCard({
  icon,
  text,
  onClick,
  disabled,
}: {
  icon: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative overflow-hidden text-left rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm border border-slate-200/80 group-hover:border-slate-400 group-hover:bg-white/80 transition-all rounded-xl shadow-sm"></div>

      <div className="relative flex items-center gap-4 p-4">
        <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors leading-snug">
          {text}
        </span>
      </div>
    </button>
  );
}

// Message Bubble Component - Editorial style
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-2 sm:gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar - Editorial square style */}
      <div className="relative shrink-0 hidden sm:block">
        <div
          className={`w-10 h-10 border rounded-xl ${isUser ? "border-slate-400 bg-slate-800" : "border-slate-300"}`}
        ></div>
        {!isUser && (
          <div className="absolute inset-1.5 bg-slate-100/50 rounded-lg"></div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {isUser ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          ) : (
            <span className="text-xs font-serif text-slate-600">AI</span>
          )}
        </div>
      </div>

      {/* Message Content - Editorial style */}
      <div
        className={`flex-1 p-3 sm:p-5 rounded-2xl shadow-sm ${
          isUser
            ? "bg-slate-800 text-white"
            : "bg-white/60 backdrop-blur-sm border border-slate-200/80"
        }`}
      >
        <p
          className={`text-sm leading-relaxed ${
            isUser ? "text-white/90" : "text-slate-700"
          }`}
        >
          {message.content}
        </p>
        <div
          className={`flex items-center gap-2 mt-3 pt-3 border-t ${
            isUser ? "border-slate-700" : "border-slate-100"
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider ${
              isUser ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.model && (
            <>
              <span
                className={`w-1 h-1 rounded-full ${isUser ? "bg-slate-600" : "bg-slate-300"}`}
              ></span>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  isUser ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {message.model}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
