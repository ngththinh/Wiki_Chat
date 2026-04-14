"use client";

import { AdminStatsDto, DailyStatsDto } from "@/lib/adminService";

interface OverviewTabProps {
  stats: AdminStatsDto | null;
  dailyStats: DailyStatsDto[];
}

export default function OverviewTab({ stats, dailyStats }: OverviewTabProps) {
  const normalizedDailyStats = dailyStats.map((day) => ({
    ...day,
    newUsers: Number(day.newUsers) || 0,
    newChatSessions: Number(day.newChatSessions) || 0,
    newMessages: Number(day.newMessages) || 0,
  }));

  const statCards = [
    {
      label: "Tổng người dùng",
      value: stats?.totalUsers ?? 0,
      iconPath:
        "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      color: "text-blue-600 bg-blue-50 border-blue-100",
      accent: "text-blue-600",
    },
    {
      label: "Phiên chat",
      value: stats?.totalChatSessions ?? 0,
      iconPath:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accent: "text-emerald-600",
    },
    {
      label: "Tin nhắn",
      value: stats?.totalChatMessages ?? 0,
      iconPath:
        "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
      color: "text-violet-600 bg-violet-50 border-violet-100",
      accent: "text-violet-600",
    },
    {
      label: "Admin",
      value: stats?.totalAdmins ?? 0,
      iconPath:
        "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      accent: "text-amber-600",
    },
  ];

  // Build a simple bar chart for dailyStats
  const last7Days = normalizedDailyStats.slice(-7);
  const maxMetricValue = Math.max(
    ...last7Days.flatMap((d) => [d.newUsers, d.newChatSessions, d.newMessages]),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.accent}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl ${card.color} border flex items-center justify-center`}
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
                    d={card.iconPath}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily stats chart */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-px bg-slate-300" />
          <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Thống kê 7 ngày qua
          </h3>
        </div>

        {last7Days.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 italic">
            Chưa có dữ liệu thống kê
          </p>
        ) : (
          <div className="space-y-6">
            {/* Bar chart */}
            <div className="flex items-center justify-end gap-5 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Người dùng
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Phiên chat
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Tin nhắn
              </span>
            </div>

            <div className="flex items-end gap-3 h-44">
              {last7Days.map((day, idx) => {
                const daySeries = [
                  { value: day.newUsers, color: "bg-blue-500" },
                  { value: day.newChatSessions, color: "bg-emerald-500" },
                  { value: day.newMessages, color: "bg-violet-500" },
                ];

                return (
                  <div
                    key={idx}
                    className="flex-1 flex h-full flex-col items-center gap-2"
                  >
                    <div className="text-[10px] text-slate-500 font-medium">
                      {day.newUsers}/{day.newChatSessions}/{day.newMessages}
                    </div>
                    <div className="w-full flex-1 rounded-md bg-slate-100 p-1.5">
                      <div className="flex h-full items-end gap-1">
                        {daySeries.map((item, seriesIdx) => {
                          const height = (item.value / maxMetricValue) * 100;
                          return (
                            <div
                              key={seriesIdx}
                              className={`flex-1 rounded-t-sm transition-all duration-500 ${item.color}`}
                              style={{ height: `${Math.max(height, 3)}%` }}
                              title={`${item.value}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {new Date(day.date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {last7Days.slice(-3).map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-4 py-3 bg-slate-50/80 rounded-lg"
                >
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">
                      {new Date(day.date).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-xs">
                        <span className="text-blue-600 font-semibold">
                          {day.newUsers}
                        </span>
                        <span className="text-slate-400 ml-1">người dùng</span>
                      </p>
                      <p className="text-xs">
                        <span className="text-emerald-600 font-semibold">
                          {day.newChatSessions}
                        </span>
                        <span className="text-slate-400 ml-1">phiên</span>
                      </p>
                      <p className="text-xs">
                        <span className="text-violet-600 font-semibold">
                          {day.newMessages}
                        </span>
                        <span className="text-slate-400 ml-1">tin nhắn</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
