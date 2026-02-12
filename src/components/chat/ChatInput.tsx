"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { ChatModel } from "@/utils/subdomain";
import { MODELS } from "@/constants";

interface ChatInputProps {
  onSendMessage: (message: string, model: ChatModel) => void;
  isLoading: boolean;
  selectedModel: ChatModel;
  onModelChange: (model: ChatModel) => void;
  isSubdomainModel?: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  selectedModel,
  onModelChange,
  isSubdomainModel = false,
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
    <div className="border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
        <div className="relative">
          {/* Glass input container */}
          <div className="relative flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-sm border border-slate-200/80 px-3 sm:px-5 py-2.5 sm:py-3 focus-within:border-slate-400 focus-within:bg-white transition-all rounded-2xl shadow-sm">
            {/* Model Selection Button - Editorial style */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium bg-slate-100/80 border border-slate-200 hover:border-slate-400 hover:bg-white transition-all rounded-xl"
                title="Select AI Model"
              >
                <svg
                  className="w-3 h-3 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
                <span className="text-slate-600">{selectedModel}</span>
                <svg
                  className={`w-2.5 h-2.5 text-slate-400 transition-transform ${
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

              {/* Dropdown Menu - Editorial style */}
              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-44 bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg z-10 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      Chọn mô hình AI
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onModelChange(MODELS.RAG as ChatModel);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      selectedModel === MODELS.RAG
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium">{MODELS.RAG}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Retrieval Model
                        </div>
                      </div>
                      {selectedModel === MODELS.RAG && (
                        <svg
                          className="w-3.5 h-3.5 text-slate-700"
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
                      onModelChange(MODELS.GRAPH_RAG as ChatModel);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      selectedModel === MODELS.GRAPH_RAG
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium">
                          {MODELS.GRAPH_RAG}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Graph Model
                        </div>
                      </div>
                      {selectedModel === MODELS.GRAPH_RAG && (
                        <svg
                          className="w-3.5 h-3.5 text-slate-700"
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

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200"></div>

            {/* Input Field */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về danh nhân Việt Nam..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm disabled:opacity-50"
            />

            {/* Send Button - Editorial style */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="group shrink-0 w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all rounded-xl"
            >
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper Text - Editorial style - hidden on very small screens */}
        <div className="hidden sm:flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[9px] rounded-md">
              Enter
            </kbd>
            <span>để gửi</span>
          </div>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] text-slate-400 italic">
            Trí tuệ nhân tạo về danh nhân Việt Nam
          </span>
        </div>
      </div>
    </div>
  );
}
