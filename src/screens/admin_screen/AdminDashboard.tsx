"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import adminService, { AdminStatsDto, DailyStatsDto } from "@/lib/adminService";
import { ROUTES } from "@/constants";
import {
  AdminSidebar,
  OverviewTab,
  UsersTab,
  SessionsTab,
  DocumentsTab,
} from "@/components/admin";

type TabType = "dashboard" | "users" | "sessions" | "documents";

const tabLabels: Record<TabType, string> = {
  dashboard: "Tổng quan",
  users: "Người dùng",
  sessions: "Phiên chat",
  documents: "Tài liệu",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Overview data
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatsDto[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role?.toLowerCase() !== "admin") {
      router.push(ROUTES.LOGIN);
      return;
    }
    setUser(currentUser);
    loadInitialData();
  }, [router]);

  const loadInitialData = async () => {
    setIsLoading(true);
    const [statsRes, dailyRes] = await Promise.all([
      adminService.getStats(),
      adminService.getDailyStats(7),
    ]);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (dailyRes.success && dailyRes.data) setDailyStats(dailyRes.data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        {/* Same background as ChatScreen */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
          }}
        />
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
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-light tracking-wide">
              Đang tải...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background — same editorial gradient as ChatScreen */}
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

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — same drawer pattern as ChatScreen */}
      <div
        className={`fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top bar — mobile header */}
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
                {tabLabels[activeTab]}
              </span>
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="relative border-b border-slate-200/50 bg-white/40 backdrop-blur-sm hidden md:block">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-serif font-medium text-slate-800 tracking-wide">
                {tabLabels[activeTab]}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mt-0.5">
                WikiChatbot &middot; Quản trị
              </p>
            </div>

            {/* Tab pills for quick switch on desktop */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/60 border border-slate-200/60 rounded-lg p-1">
              {(Object.keys(tabLabels) as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === "dashboard" && (
              <OverviewTab stats={stats} dailyStats={dailyStats} />
            )}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "sessions" && <SessionsTab />}
            {activeTab === "documents" && <DocumentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
