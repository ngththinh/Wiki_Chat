"use client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate: () => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  onRegenerate,
}: ChatMessagesProps) {
  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const showRegenerateButton =
    hasMessages && lastMessage?.role === "assistant" && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome to WikiChatbot!
            </h2>
            <p className="text-gray-600 max-w-md mb-8">
              Ask me anything about entrepreneurs, business strategies, or
              startup insights. I'm here to help you learn and grow!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <SuggestionCard
                icon="💡"
                text="What made Elon Musk successful?"
              />
              <SuggestionCard icon="🚀" text="How to start a tech startup?" />
              <SuggestionCard
                icon="📈"
                text="Best business strategies for growth"
              />
              <SuggestionCard
                icon="💼"
                text="Lessons from successful entrepreneurs"
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regenerate Button */}
        {showRegenerateButton && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-blue-500 text-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Regenerate response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({ icon, text }: { icon: string; text: string }) {
  return (
    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
        {text}
      </span>
    </button>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-gray-600 to-gray-800"
            : "bg-gradient-to-br from-blue-500 to-purple-500"
        }`}
      >
        {isUser ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 rounded-2xl p-4 shadow-sm ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            : "bg-white border border-gray-100"
        }`}
      >
        <p
          className={`text-sm leading-relaxed ${
            isUser ? "text-white" : "text-gray-800"
          }`}
        >
          {message.content}
        </p>
        <span
          className={`text-xs mt-2 block ${
            isUser ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
