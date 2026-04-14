"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import adminService, { DetailDto } from "@/lib/adminService";

const normalizeEntityName = (value: string) =>
  value
    .trim()
    .replace(/\.(md|txt|markdown)$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function DetailPersonClient() {
  const searchParams = useSearchParams();

  const detailId = useMemo(() => {
    const rawId = searchParams.get("id");
    if (!rawId) return "";
    return decodeURIComponent(rawId);
  }, [searchParams]);

  const entityName = useMemo(() => {
    const rawName = searchParams.get("entityName") || searchParams.get("name");
    if (!rawName) return "";
    return decodeURIComponent(rawName);
  }, [searchParams]);

  const categoryId = searchParams.get("categoryId") || "";
  const categoryName = searchParams.get("categoryName") || "Danh mục";
  const fallbackName = searchParams.get("name") || "Danh nhân";

  const [detail, setDetail] = useState<DetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!detailId && !entityName) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let dbDetail: DetailDto | null = null;
      if (detailId) {
        const dbResponse = await adminService.getDetail(detailId);
        if (dbResponse.success && dbResponse.data) {
          dbDetail = dbResponse.data;
        }
      }

      let summaryDetail: DetailDto | null = null;
      const candidates = [
        normalizeEntityName(entityName),
        normalizeEntityName(fallbackName),
        normalizeEntityName(dbDetail?.title || ""),
      ].filter((name, index, arr) => name && arr.indexOf(name) === index);

      for (const candidate of candidates) {
        const response = await adminService.getPersonSummaryDetail({
          entityName: candidate,
          language: "vi",
          isAutoSave: false,
        });

        if (response.success && response.data) {
          summaryDetail = response.data;
          break;
        }
      }

      let mergedDetail: DetailDto | null = null;
      if (dbDetail && summaryDetail) {
        mergedDetail = {
          id: dbDetail.id,
          title: dbDetail.title || summaryDetail.title,
          content: summaryDetail.content || dbDetail.content,
          wikipediaUrl: summaryDetail.wikipediaUrl || dbDetail.wikipediaUrl,
          categoryId: dbDetail.categoryId,
          categoryName: dbDetail.categoryName,
          createdAt: summaryDetail.createdAt || dbDetail.createdAt,
        };
      } else {
        mergedDetail = summaryDetail || dbDetail;
      }

      setDetail(mergedDetail);
      setIsLoading(false);
    };

    loadDetail();
  }, [detailId, entityName, fallbackName]);

  const personName = useMemo(
    () => normalizeEntityName(detail?.title || entityName || fallbackName),
    [detail?.title, entityName, fallbackName],
  );
  const personContent = detail?.content?.trim() || "";
  const wikipediaUrl = detail?.wikipediaUrl?.trim() || "";

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
                Hồ sơ danh nhân
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.05]">
              {personName}
            </h1>
            <p className="text-slate-500 mt-4 text-base sm:text-lg">
              Thuộc lĩnh vực: {categoryName}
            </p>
          </div>

          <Link
            href={`/categories?categoryId=${encodeURIComponent(detail?.categoryId || categoryId)}&name=${encodeURIComponent(detail?.categoryName || categoryName)}`}
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
        ) : !detail ? (
          <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm px-6 py-14 text-center">
            <p className="text-slate-700 text-lg font-serif mb-2">
              Không tìm thấy danh nhân
            </p>
            <p className="text-slate-500 text-sm">
              Dữ liệu chi tiết có thể đã bị thay đổi hoặc chưa sẵn sàng.
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200 uppercase tracking-wide">
                {detail.categoryName || categoryName}
              </span>
              <span className="text-xs text-slate-400">
                Cập nhật{" "}
                {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
              {personName}
            </h2>

            {personContent && (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base sm:text-lg mb-8">
                {personContent}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {wikipediaUrl && (
                <a
                  href={wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Xem nguồn Wikipedia
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
                      d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M7.5 9H6a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-1.5"
                    />
                  </svg>
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
