"use client";

import { useState, useRef, useEffect } from "react";
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

  return (
    <div className="w-72 relative flex flex-col overflow-visible">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
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
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="w-9 h-9 border border-white/15 rounded-lg" />
              <div className="absolute inset-1.5 bg-white/5 rounded" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-serif font-medium text-white/80">
                W
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-serif font-medium text-white/90 tracking-wide">
                WikiChatbot
              </span>
              <span className="text-[9px] text-white/35 uppercase tracking-[0.15em]">
                Danh nhân Việt Nam
              </span>
            </div>
          </div>

          {/* New Chat & Search - Bo tròn nhẹ */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/15 text-white/90 hover:bg-white/15 hover:border-white/25 transition-all text-sm font-medium tracking-wide rounded-lg"
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

            <button className="w-11 h-11 border border-white/15 text-white/50 flex items-center justify-center hover:bg-white/10 hover:text-white/80 transition-colors rounded-lg">
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
                <div className="w-5 h-px bg-white/15" />
                <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-[0.2em]">
                  Lịch sử
                </h3>
              </div>
              {conversationsData.length > 0 && (
                <button
                  onClick={openClearAllModal}
                  className="text-[10px] text-white/25 hover:text-white/50 uppercase tracking-wider transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[11px] text-white/30 italic">
                  Chưa có lịch sử trò chuyện
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => onSelectChat?.(conv.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-all rounded-lg ${
                        currentChat === conv.id
                          ? "bg-white/8 text-white/85 border border-white/10"
                          : "text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent"
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
                            className="flex-1 bg-white/10 border border-white/20 px-2 py-0.5 text-sm text-white focus:outline-none rounded"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate flex-1 font-light">
                            {conv.title}
                          </span>
                        )}
                        {conv.pinned && (
                          <svg
                            className="w-3 h-3 text-white/35 shrink-0"
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
                        className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/35 hover:text-white/60 hover:bg-white/10 rounded"
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
        <div className="p-4 border-t border-white/8">
          {/* Logged In User - Bo tròn nhẹ */}
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 border border-white/8 rounded-lg">
            <div className="w-9 h-9 bg-slate-600/80 flex items-center justify-center text-white/80 font-serif text-sm rounded-lg">
              {user?.fullName?.[0]?.toUpperCase() ||
                user?.username?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/85 truncate font-medium">
                {user?.fullName || user?.username || user?.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-white/35 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center justify-center text-white/35 hover:text-white/60 transition-all rounded-lg"
              title="Đăng xuất"
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
            </button>
          </div>
        </div>
      </div>

      {/* Global Dropdown Menu - Bo tròn */}
      {activeMenu && (
        <div
          ref={menuRef}
          className="fixed w-44 bg-slate-800/95 backdrop-blur-sm border border-white/10 py-1.5 z-[9999] shadow-xl rounded-lg"
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
            className="w-full px-4 py-2.5 text-left text-sm text-white/60 hover:bg-white/8 hover:text-white/85 flex items-center gap-3 transition-colors mx-1 rounded-md"
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
            className="w-full px-4 py-2.5 text-left text-sm text-white/60 hover:bg-white/8 hover:text-white/85 flex items-center gap-3 transition-colors mx-1 rounded-md"
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
          <div className="my-1.5 mx-2 border-t border-white/8" />
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
    </div>
  );
}
