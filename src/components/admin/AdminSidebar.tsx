"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import authService from "@/lib/authService";
import { ROUTES } from "@/constants";
import ConfirmModal from "@/components/common/ConfirmModal";

type TabType = "dashboard" | "users" | "sessions" | "documents";

interface AdminSidebarProps {
  user: any;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
}

const navItems: { id: TabType; label: string; iconPath: string }[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    iconPath:
      "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
  {
    id: "users",
    label: "Người dùng",
    iconPath:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    id: "sessions",
    label: "Phiên chat",
    iconPath:
      "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    id: "documents",
    label: "Danh Nhân",
    iconPath:
      "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
];

export default function AdminSidebar({
  user,
  activeTab,
  onTabChange,
  onCloseMobile,
  collapsed = false,
  onToggleSidebar,
}: AdminSidebarProps) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isAccountMenuOpen]);

  const confirmLogout = () => {
    authService.logout();
    window.location.href = ROUTES.LOGIN;
  };

  const handleOpenLogout = () => {
    setIsAccountMenuOpen(false);
    setLogoutModalOpen(true);
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full relative flex flex-col">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
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
            type="button"
            onClick={() => onToggleSidebar?.()}
            className="group relative z-20 w-10 h-10 rounded-xl border border-slate-300 bg-white hover:border-slate-400 transition-colors pointer-events-auto"
            title="Mở thanh quản trị"
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

          <div className="mt-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile?.();
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
                  activeTab === item.id
                    ? "bg-slate-100 text-slate-800 border-slate-200"
                    : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-800"
                }`}
                title={item.label}
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
                    d={item.iconPath}
                  />
                </svg>
              </button>
            ))}

            <Link
              href="/chat"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Trở về Chat"
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
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </Link>
          </div>

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
                "A"}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-0 left-full ml-2 w-44 bg-white/95 backdrop-blur-sm border border-slate-200 py-1.5 z-50 shadow-xl rounded-lg">
                <Link
                  href={ROUTES.CHAT}
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
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  Trò chuyện
                </Link>
                <button
                  onClick={handleOpenLogout}
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
      {/* Background — same as ChatSidebarNav */}
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
            <Link href="/" className="flex items-center gap-3 min-w-0 group">
              <div className="relative shrink-0">
                <div className="w-9 h-9 border border-slate-300 rounded-lg" />
                <div className="absolute inset-1.5 bg-slate-100 rounded" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-serif font-medium text-slate-700">
                  W
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-serif font-medium text-slate-800 tracking-wide truncate">
                  WikiChatbot
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em] truncate">
                  Quản trị hệ thống
                </span>
              </div>
            </Link>

            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden md:inline-flex w-9 h-9 border border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-400 items-center justify-center transition-colors rounded-lg shrink-0"
                title="Thu gọn thanh quản trị"
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-5 h-px bg-slate-200" />
            <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
              Điều hướng
            </h3>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-all rounded-lg flex items-center gap-3 ${
                  activeTab === item.id
                    ? "bg-slate-100 text-slate-800 border border-slate-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
                }`}
              >
                <svg
                  className="w-4.5 h-4.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.iconPath}
                  />
                </svg>
                <span className="font-light">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer - User Profile */}
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
                  user?.email?.[0]?.toUpperCase() ||
                  "A"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-slate-800 truncate font-medium">
                  {user?.fullName ||
                    user?.username ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.role === "Admin" || user?.role === "admin"
                    ? "Quản trị viên"
                    : user?.email}
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
                <Link
                  href={ROUTES.CHAT}
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
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  Trò chuyện
                </Link>
                <button
                  onClick={handleOpenLogout}
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
