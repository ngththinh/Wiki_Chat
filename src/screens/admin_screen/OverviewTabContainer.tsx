"use client";

import { useEffect, useState } from "react";
import adminService, { AdminStatsDto, DailyStatsDto } from "@/lib/adminService";
import { OverviewTab } from "@/components/admin";

export default function OverviewTabContainer() {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setIsLoading(true);
      const [statsRes, dailyRes] = await Promise.all([
        adminService.getStats(),
        adminService.getDailyStats(7),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (dailyRes.success && dailyRes.data) {
        setDailyStats(dailyRes.data);
      }

      setIsLoading(false);
    };

    void loadOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-light tracking-wide">
            Đang tải dữ liệu tổng quan...
          </p>
        </div>
      </div>
    );
  }

  return <OverviewTab stats={stats} dailyStats={dailyStats} />;
}
