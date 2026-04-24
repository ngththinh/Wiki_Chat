"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import adminService, { DetailDto } from "@/lib/adminService";

const trimText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

const stripHtmlTags = (value: string) =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeEntityName = (value: string) =>
  value
    .trim()
    .replace(/\.(md|txt|markdown|html|htm)$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSearchText = (value: string) =>
  normalizeEntityName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function CategoryPeopleClient() {
  const params = useParams<{ categoryId?: string }>();
  const searchParams = useSearchParams();

  const categoryIdFromPath = useMemo(() => {
    if (!params?.categoryId || Array.isArray(params.categoryId)) return "";
    return decodeURIComponent(params.categoryId);
  }, [params]);

  const categoryId = useMemo(() => {
    if (categoryIdFromPath) return categoryIdFromPath;
    const rawId = searchParams.get("categoryId");
    if (!rawId) return "";
    return decodeURIComponent(rawId);
  }, [categoryIdFromPath, searchParams]);

  const [details, setDetails] = useState<DetailDto[]>([]);
  const [categoryNameById, setCategoryNameById] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [detailsResponse, categoriesResponse] = await Promise.all([
        adminService.getDetailsByCategory(categoryId),
        adminService.getCategories(),
      ]);

      if (detailsResponse.success && detailsResponse.data) {
        setDetails(detailsResponse.data);
      } else {
        setDetails([]);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        const matchedCategory = categoriesResponse.data.find(
          (item) => item.id === categoryId,
        );
        setCategoryNameById(matchedCategory?.name?.trim() || "");
      } else {
        setCategoryNameById("");
      }

      setIsLoading(false);
    };

    void loadData();
  }, [categoryId]);

  const categoryName = useMemo(() => {
    const detailCategoryName = details.find((item) =>
      item.categoryName?.trim(),
    )?.categoryName;
    return detailCategoryName || categoryNameById || "Danh mục";
  }, [details, categoryNameById]);

  const normalizedSearchTerm = useMemo(
    () => normalizeSearchText(searchTerm),
    [searchTerm],
  );

  const filteredDetails = useMemo(() => {
    if (!normalizedSearchTerm) return details;

    return details.filter((person) => {
      const normalizedTitle = normalizeSearchText(person.title || "");
      return normalizedTitle.includes(normalizedSearchTerm);
    });
  }, [details, normalizedSearchTerm]);

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
        <div className="space-y-4 mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <Link
                href="/#categories"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-4"
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

              <h1 className="text-3xl sm:text-4xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-[1.05]">
                {categoryName}
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-500 text-base sm:text-lg">
              Tất cả danh nhân thuộc danh mục này.
            </p>

            {details.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-80">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm danh nhân theo tên..."
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-11 py-3 text-sm text-slate-700 outline-none transition-all focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  />
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="m21 21-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {normalizedSearchTerm && (
                  <p className="mt-2 text-xs text-slate-500">
                    Tìm thấy {filteredDetails.length} kết quả với từ khóa "
                    {searchTerm}"
                  </p>
                )}
              </div>
            )}
          </div>
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
          <div className="space-y-5">
            {filteredDetails.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm px-6 py-10 text-center">
                <p className="text-slate-700 text-lg font-serif mb-2">
                  Không tìm thấy danh nhân phù hợp
                </p>
                <p className="text-slate-500 text-sm">
                  Thử từ khóa khác hoặc rút gọn từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredDetails.map((person) => {
                  const personTitle = normalizeEntityName(
                    person.title || "Đang cập nhật",
                  );
                  const previewSource =
                    person.description?.trim() ||
                    stripHtmlTags(person.content || "") ||
                    "Dữ liệu tiểu sử đang được cập nhật.";
                  const description = trimText(previewSource, 500);
                  const thumbnailUrl = person.thumbnailUrl?.trim() || "";

                  return (
                    <article
                      key={person.id}
                      className="relative flex flex-col justify-between bg-white/60 border border-gray-300 p-3"
                    >
                      <div>
                        <div className="float-right ml-2 flex items-center justify-center overflow-hidden">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={personTitle}
                              className="w-[140px]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-[200px] w-[140px] bg-gray-200 items-center justify-center px-3 text-xs text-slate-500">
                              Không có ảnh
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-[1.3rem] font-serif font-bold text-slate-900 mb-3 leading-tight">
                            {personTitle}
                          </h2>
                          <p className="text-slate-600 leading-relaxed mb-6">
                            {description}
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 cursor-default text-blue-500">
                        <Link
                          className=" text-sm hover:underline transition-all duration-200 cursor-pointer"
                          href={`/categories/detail?id=${encodeURIComponent(person.id)}`}
                        >
                          Xem thêm thông tin chi tiết
                        </Link>
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
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
