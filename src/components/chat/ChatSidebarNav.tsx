"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import authService from "@/lib/authService";
import historyService from "@/lib/historyService";
import { ROUTES } from "@/constants";
import ConfirmModal from "@/components/common/ConfirmModal";

interface ChatSidebarNavProps {
  user: any;
  isGuest?: boolean;
  onNewChat: () => void;
  onSelectChat?: (sessionId: string) => void;
  currentChat: string | null;
  refreshTrigger?: number;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
  isPendingConversation?: boolean;
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
  onSelectChat,
  currentChat,
  refreshTrigger = 0,
  collapsed = false,
  onToggleSidebar,
  isPendingConversation = false,
}: ChatSidebarNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const [conversationsData, setConversationsData] = useState<Conversation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      if (isGuest) {
        setConversationsData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await historyService.getConversations();
        if (response.success && response.data) {
          setConversationsData(response.data.conversations);
        }
      } catch (error) {
        // Error fetching conversations
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isGuest, refreshTrigger]); // Thêm refreshTrigger để refresh khi có thay đổi

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
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

  const allConversationsData: Conversation[] = conversationsData.map(
    (conv) => ({
      ...conv,
      pinned: pinnedConversations.includes(conv.id),
    }),
  );

  const conversations = [...allConversationsData].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    authService.logout();
    localStorage.removeItem("guestChatMessages");
    window.location.href = ROUTES.CHAT;
  };

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setActiveMenu(null);
  };

  const handleSaveRename = async (id: string) => {
    if (editTitle.trim()) {
      try {
        const response = await historyService.renameConversation(
          id,
          editTitle.trim(),
        );
        if (response.success) {
          setConversationsData((prev) =>
            prev.map((conv) =>
              conv.id === id ? { ...conv, title: editTitle.trim() } : conv,
            ),
          );
        }
      } catch (error) {
        // Error renaming
      }
    }
    setEditingId(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
    setActiveMenu(null);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await historyService.deleteConversation(deleteTargetId);
      setConversationsData((prev) =>
        prev.filter((conv) => conv.id !== deleteTargetId),
      );
      setPinnedConversations((prev) =>
        prev.filter((convId) => convId !== deleteTargetId),
      );
    } catch (error) {
      // Error deleting
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  // Open clear all confirmation modal
  const openClearAllModal = () => {
    setClearAllModalOpen(true);
  };

  const handleConfirmClearAll = async () => {
    try {
      await historyService.clearAllSessions();
      setConversationsData([]);
      setPinnedConversations([]);
    } catch (error) {
      // Error clearing
    } finally {
      setClearAllModalOpen(false);
    }
  };

  const handlePin = (id: string) => {
    // Note: Backend doesn't support pin feature, this is local only
    setPinnedConversations((prev) => {
      if (prev.includes(id)) {
        return prev.filter((convId) => convId !== id);
      } else {
        return [...prev, id];
      }
    });
    setActiveMenu(null);
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full relative flex flex-col">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #475569 1px, transparent 1px),
              linear-gradient(to bottom, #475569 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center h-full py-4 border-r border-slate-200/80">
          <button
            onClick={onToggleSidebar}
            className="group relative w-10 h-10 rounded-xl border border-slate-300 bg-white hover:border-slate-400 transition-colors"
            title="Mở lịch sử trò chuyện"
          >
            <span className="absolute inset-0 flex items-center justify-center text-sm font-serif font-medium text-slate-700 transition-opacity group-hover:opacity-0">
              W
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5 text-slate-700"
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
            </span>
          </button>

          <button
            onClick={onNewChat}
            className="mt-4 w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Trò chuyện mới"
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

          <div className="mt-auto relative" ref={accountMenuRef}>
            <button
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              className="w-10 h-10 bg-slate-200 flex items-center justify-center text-slate-700 font-serif text-sm rounded-xl hover:bg-slate-300 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              title="Tài khoản"
            >
              {user?.fullName?.[0]?.toUpperCase() ||
                user?.username?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-0 left-full ml-2 w-44 bg-white/95 backdrop-blur-sm border border-slate-200 py-1.5 z-50 shadow-xl rounded-lg">
                {user?.role?.toLowerCase() === "admin" && (
                  <Link
                    href={ROUTES.ADMIN}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 transition-colors rounded-md"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Quản trị hệ thống
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors rounded-md"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full relative flex flex-col overflow-visible">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80">
          <div className="flex items-start justify-between gap-2 mb-5">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 border border-slate-300 rounded-lg" />
                <div className="absolute inset-1.5 bg-slate-100 rounded" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-serif font-medium text-slate-700">
                  W
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-serif font-medium text-slate-800 tracking-wide truncate">
                  WikichatbotAI
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em] truncate">
                  Hỏi đáp về danh nhân
                </span>
              </div>
            </Link>

            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden md:inline-flex w-9 h-9 border border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-400 items-center justify-center transition-colors rounded-lg shrink-0"
                title="Thu gọn thanh lịch sử"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 5.25h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5zM8.25 5.25v13.5"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* New Chat & Search - Bo tròn nhẹ */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 hover:border-slate-300 transition-all text-sm font-medium tracking-wide rounded-lg"
            >
              <svg
                className="w-4 h-4"
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
              Trò chuyện mới
            </button>

            <button className="w-11 h-11 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-colors rounded-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto overflow-x-visible px-4 py-3">
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px bg-slate-200" />
                <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
                  Lịch sử
                </h3>
              </div>
              {conversationsData.length > 0 && (
                <button
                  onClick={openClearAllModal}
                  className="text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {isPendingConversation && (
                  <div className="relative px-3 py-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 animate-pulse">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 shrink-0 opacity-40 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
                      <div className="flex-1 h-4 rounded bg-slate-300/50" />
                    </div>
                  </div>
                )}

                {conversations.length === 0 && !isPendingConversation && (
                  <div className="text-center py-8">
                    <p className="text-[11px] text-slate-400 italic">
                      Chưa có lịch sử trò chuyện
                    </p>
                  </div>
                )}

                {conversations.map((conv) => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => onSelectChat?.(conv.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-all rounded-lg ${
                        currentChat === conv.id
                          ? "bg-slate-100 text-slate-800 border border-slate-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-8">
                        <svg
                          className="w-4 h-4 shrink-0 opacity-30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
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
                            className="flex-1 bg-white border border-slate-300 px-2 py-0.5 text-sm text-slate-800 focus:outline-none rounded"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate flex-1 font-light">
                            {conv.title}
                          </span>
                        )}
                        {conv.pinned && (
                          <svg
                            className="w-3 h-3 text-slate-400 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Menu dots - Bo tròn */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={(e) => handleMenuToggle(conv.id, e)}
                        className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      >
                        <svg
                          className="w-4 h-4"
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
            )}
          </div>
        </div>

        {/* Footer - User Profile Only (No Settings) */}
        <div className="p-4 border-t border-slate-200/80">
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 px-3 py-3 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              title="Tài khoản"
            >
              <div className="w-9 h-9 bg-slate-300 flex items-center justify-center text-slate-700 font-serif text-sm rounded-lg">
                {user?.fullName?.[0]?.toUpperCase() ||
                  user?.username?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-slate-800 truncate font-medium">
                  {user?.fullName ||
                    user?.username ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  isAccountMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white/95 backdrop-blur-sm border border-slate-200 py-1.5 z-50 shadow-xl rounded-lg">
                {user?.role?.toLowerCase() === "admin" && (
                  <Link
                    href={ROUTES.ADMIN}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 transition-colors rounded-md"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Quản trị hệ thống
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors rounded-md"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Dropdown Menu - Bo tròn */}
      {activeMenu && (
        <div
          ref={menuRef}
          className="fixed w-44 bg-white/95 backdrop-blur-sm border border-slate-200 py-1.5 z-9999 shadow-xl rounded-lg"
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
            className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 transition-colors mx-1 rounded-md"
            style={{ width: "calc(100% - 8px)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Đổi tên
          </button>
          <button
            onClick={() => activeMenu && handlePin(activeMenu)}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 transition-colors mx-1 rounded-md"
            style={{ width: "calc(100% - 8px)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
            {pinnedConversations.includes(activeMenu || "")
              ? "Bỏ ghim"
              : "Ghim đoạn chat"}
          </button>
          <div className="my-1.5 mx-2 border-t border-slate-200" />
          <button
            onClick={() => activeMenu && openDeleteModal(activeMenu)}
            className="w-full px-4 py-2.5 text-left text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors mx-1 rounded-md"
            style={{ width: "calc(100% - 8px)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Xóa
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={clearAllModalOpen}
        title="Xóa tất cả lịch sử"
        message="Bạn có chắc chắn muốn xóa tất cả lịch sử trò chuyện? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setClearAllModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
