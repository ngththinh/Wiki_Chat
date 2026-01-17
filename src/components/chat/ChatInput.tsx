"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

export type ChatModel = "RAG" | "GraphRAG";

interface ChatInputProps {
  onSendMessage: (message: string, model: ChatModel) => void;
  isLoading: boolean;
  selectedModel: ChatModel;
  onModelChange: (model: ChatModel) => void;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message, selectedModel);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative flex items-center gap-3 bg-gray-50 rounded-full px-5 py-3 shadow-sm border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Model Selection Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm group"
              title="Select AI Model"
            >
              <svg
                className="w-3 h-3 text-blue-600 group-hover:text-blue-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <span className="text-gray-700 group-hover:text-blue-700">
                {selectedModel}
              </span>
              <svg
                className={`w-2.5 h-2.5 text-gray-500 group-hover:text-blue-600 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-10">
                <div className="px-2.5 py-1.5 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    Select Model
                  </p>
                </div>
                <button
                  onClick={() => {
                    onModelChange("RAG");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-[11px] font-medium transition-colors ${
                    selectedModel === "RAG"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-[11px]">RAG</div>
                      <div className="text-[9px] text-gray-500">
                        Retrieval Model
                      </div>
                    </div>
                    {selectedModel === "RAG" && (
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => {
                    onModelChange("GraphRAG");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-[11px] font-medium transition-colors ${
                    selectedModel === "GraphRAG"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-[11px]">GraphRAG</div>
                      <div className="text-[9px] text-gray-500">
                        Graph Model
                      </div>
                    </div>
                    {selectedModel === "GraphRAG" && (
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's in your mind..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 shadow-md"
          >
            {isLoading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Press{" "}
          <kbd className="px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">
            Enter
          </kbd>{" "}
          to send • AI-powered entrepreneurial insights
        </p>
      </div>
    </div>
  );
}
