"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import adminService, { DetailDto } from "@/lib/adminService";

const trimText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

export default function CategoryPeopleClient() {
  const searchParams = useSearchParams();
  const categoryName = searchParams.get("name") || "Danh mục";

  const categoryId = useMemo(() => {
    const rawId = searchParams.get("categoryId");
    if (!rawId) return "";
    return decodeURIComponent(rawId);
  }, [searchParams]);

  const [details, setDetails] = useState<DetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const response = await adminService.getDetailsByCategory(categoryId);
      if (response.success && response.data) {
        setDetails(response.data);
      } else {
        setDetails([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [categoryId]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-px bg-slate-300" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">
                Danh mục
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.05]">
              {categoryName}
            </h1>
            <p className="text-slate-500 mt-4 text-base sm:text-lg">
              Tất cả danh nhân thuộc danh mục này.
            </p>
          </div>

          <Link
            href="/#categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại danh mục
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : details.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm px-6 py-14 text-center">
            <p className="text-slate-700 text-lg font-serif mb-2">
              Chưa có danh nhân
            </p>
            <p className="text-slate-500 text-sm">
              Dữ liệu cho danh mục này đang được cập nhật.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {details.map((person) => (
              <article
                key={person.id}
                className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3">
                  Danh nhân
                </p>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 leading-tight">
                  {person.title || "Đang cập nhật"}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {trimText(
                    (
                      person.content || "Dữ liệu tiểu sử đang được cập nhật."
                    ).trim(),
                    220,
                  )}
                </p>
                <Link
                  href={`/categories/detail?id=${encodeURIComponent(person.id)}&entityName=${encodeURIComponent(person.title || "Danh nhân")}&name=${encodeURIComponent(person.title || "Danh nhân")}&categoryId=${encodeURIComponent(categoryId)}&categoryName=${encodeURIComponent(categoryName)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Thông tin chi tiết
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
