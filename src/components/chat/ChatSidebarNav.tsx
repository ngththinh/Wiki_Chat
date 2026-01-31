"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import { ROUTES } from "@/constants";

interface ChatSidebarNavProps {
  user: any;
  isGuest?: boolean;
  onNewChat: () => void;
  currentChat: string | null;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  pinned: boolean;
}

export default function ChatSidebarNav({
  user,
  isGuest = false,
  onNewChat,
  currentChat,
}: ChatSidebarNavProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const [conversationsData, setConversationsData] = useState<Conversation[]>([
    {
      id: "1",
      title: "Create html game environment f...",
      timestamp: new Date(2026, 0, 15, 10, 30),
      pinned: false,
    },
    {
      id: "2",
      title: "Lorem Ipsum Project",
      timestamp: new Date(2026, 0, 15, 9, 15),
      pinned: false,
    },
    {
      id: "3",
      title: "Lorem Project...",
      timestamp: new Date(2026, 0, 14, 16, 45),
      pinned: false,
    },
    {
      id: "4",
      title: "Crypto Lending App",
      timestamp: new Date(2026, 0, 13, 14, 20),
      pinned: false,
    },
    {
      id: "5",
      title: "Operator Grammar Types",
      timestamp: new Date(2026, 0, 12, 11, 10),
      pinned: false,
    },
    {
      id: "6",
      title: "Min States For Binary DFA",
      timestamp: new Date(2026, 0, 11, 15, 30),
      pinned: false,
    },
    {
      id: "7",
      title: "Lorem POS system",
      timestamp: new Date(2026, 0, 10, 9, 45),
      pinned: false,
    },
  ]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = (
    convId: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (activeMenu === convId) {
      setActiveMenu(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.right + 8,
      });
      setActiveMenu(convId);
    }
  };

  // Update conversations with pinned status
  const allConversationsData: Conversation[] = conversationsData.map(
    (conv) => ({
      ...conv,
      pinned: pinnedConversations.includes(conv.id),
    }),
  );

  // Sort: pinned first, then by timestamp (newest first)
  const conversations = [...allConversationsData].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleLogout = () => {
    authService.logout();
    // Clear guest messages from localStorage on logout
    localStorage.removeItem("guestChatMessages");
    // Force reload to reset to clean guest state
    window.location.href = ROUTES.CHAT;
  };

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setActiveMenu(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      setConversationsData((prev) =>
        prev.map((conv) =>
          conv.id === id ? { ...conv, title: editTitle.trim() } : conv,
        ),
      );
      // TODO: Call API to save to backend
      console.log("Renamed conversation", id, "to", editTitle);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa đoạn chat này?")) {
      setConversationsData((prev) => prev.filter((conv) => conv.id !== id));
      setPinnedConversations((prev) => prev.filter((convId) => convId !== id));
      // TODO: Call API to delete from backend
      console.log("Deleted conversation", id);
      setActiveMenu(null);
    }
  };

  const handlePin = (id: string) => {
    // TODO: Call API to pin/unpin
    setPinnedConversations((prev) => {
      if (prev.includes(id)) {
        return prev.filter((convId) => convId !== id);
      } else {
        return [...prev, id];
      }
    });
    console.log("Pin/Unpin conversation", id);
    setActiveMenu(null);
  };

  return (
    <div className="w-64 bg-linear-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col overflow-visible">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="font-bold text-gray-800 text-lg">NAME</span>
        </div>

        {/* New Chat & Search */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Trò chuyện mới
          </button>

          <button className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors shrink-0">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto overflow-x-visible p-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Lịch sử trò chuyện
            </h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Xóa tất cả
            </button>
          </div>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="relative group">
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentChat === conv.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2 pr-8">
                    <svg
                      className="w-4 h-4 shrink-0"
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
                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(conv.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 bg-white border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate flex-1">{conv.title}</span>
                    )}
                    {conv.pinned && (
                      <svg
                        className="w-3.5 h-3.5 text-blue-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Menu 3 chấm */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={(e) => handleMenuToggle(conv.id, e)}
                    className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - User Profile & Settings */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Cài đặt</span>
        </button>

        {/* Logged In User */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors"
            title="Logout"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Global Dropdown Menu */}
      {activeMenu && (
        <div
          ref={menuRef}
          className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-9999"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <button
            onClick={() => {
              const conv = [...allConversationsData].find(
                (c) => c.id === activeMenu,
              );
              if (conv && activeMenu) handleRename(activeMenu, conv.title);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Đổi tên
          </button>
          <button
            onClick={() => activeMenu && handlePin(activeMenu)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {pinnedConversations.includes(activeMenu || "")
              ? "Bỏ ghim"
              : "Ghim đoạn chat"}
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={() => activeMenu && handleDelete(activeMenu)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}
