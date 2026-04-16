"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import adminService, { DetailDto } from "@/lib/adminService";

const normalizeEntityName = (value: string) =>
  value
    .trim()
    .replace(/\.(md|txt|markdown|html|htm)$/i, "")
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

  const [detail, setDetail] = useState<DetailDto | null>(null);
  const [categoryNameById, setCategoryNameById] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!detailId) {
        setIsLoading(false);
        setDetail(null);
        return;
      }

      setIsLoading(true);
      const dbResponse = await adminService.getDetail(detailId);
      setDetail(dbResponse.success && dbResponse.data ? dbResponse.data : null);
      setIsLoading(false);
    };

    loadDetail();
  }, [detailId]);

  useEffect(() => {
    const categoryId = detail?.categoryId?.trim() || "";
    const categoryName = detail?.categoryName?.trim() || "";

    if (!categoryId || categoryName) {
      setCategoryNameById("");
      return;
    }

    let active = true;

    const loadCategoryName = async () => {
      const categoriesResponse = await adminService.getCategories();
      if (!active) return;

      if (categoriesResponse.success && categoriesResponse.data) {
        const matchedCategory = categoriesResponse.data.find(
          (item) => item.id === categoryId,
        );
        setCategoryNameById(matchedCategory?.name?.trim() || "");
      } else {
        setCategoryNameById("");
      }
    };

    void loadCategoryName();

    return () => {
      active = false;
    };
  }, [detail?.categoryId, detail?.categoryName]);

  const personName = useMemo(
    () => normalizeEntityName(detail?.title || "Danh nhân"),
    [detail?.title],
  );
  const resolvedCategoryName =
    detail?.categoryName?.trim() || categoryNameById || "Danh mục";
  const resolvedCategoryId = detail?.categoryId || "";
  const categoryHref = resolvedCategoryId
    ? `/categories/${encodeURIComponent(resolvedCategoryId)}`
    : "/#categories";
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
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-slate-300" />
                  <div className="h-3 w-36 rounded bg-slate-200/80" />
                </div>
                <div className="h-12 w-72 rounded-lg bg-slate-200/80 sm:h-14 sm:w-96" />
                <div className="h-6 w-64 rounded-lg bg-slate-200/70" />
              </div>
            ) : (
              <>
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
                  Thuộc lĩnh vực: {resolvedCategoryName}
                </p>
              </>
            )}
          </div>

          <Link
            href={categoryHref}
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
          <div className="space-y-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-11 w-2/3 rounded-lg bg-slate-200/80" />
              <div className="h-6 w-1/3 rounded-lg bg-slate-200/70" />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-7 w-32 rounded-lg bg-slate-200/80" />
                <div className="h-5 w-28 rounded-lg bg-slate-200/70" />
              </div>

              <div className="mb-4 h-9 w-2/5 rounded-lg bg-slate-200/80" />
              <div className="mb-3 h-5 w-3/4 rounded-lg bg-slate-200/70" />

              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200/70" />
                <div className="h-4 w-full rounded bg-slate-200/70" />
                <div className="h-4 w-11/12 rounded bg-slate-200/70" />
                <div className="h-4 w-10/12 rounded bg-slate-200/70" />
                <div className="h-4 w-8/12 rounded bg-slate-200/70" />
              </div>
            </section>
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
                {resolvedCategoryName}
              </span>
              <span className="text-xs text-slate-400">
                Ngày tạo{" "}
                {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
              {personName}
            </h2>

            {wikipediaUrl && (
              <p className="text-sm text-slate-600 break-all mb-6">
                Xem thêm ở Wiki:{" "}
                <a
                  href={wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {wikipediaUrl}
                </a>
              </p>
            )}

            {personContent && (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base sm:text-lg mb-8">
                {personContent}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
