"use client";

import {
  CreateDetailDto,
  CategoryDto,
  WikipediaSearchResultDto,
} from "@/lib/adminService";
import WikipediaSearchResults from "@/components/admin/WikipediaSearchResults";

type CreatePipelineStep =
  | "queued"
  | "jobs"
  | "polling"
  | "saving"
  | "completed";

interface CreatePipelineProgress {
  visible: boolean;
  step: CreatePipelineStep;
  status: "running" | "success" | "error";
  note: string;
  error?: string;
}

interface CreateDetailFormProps {
  newDetail: CreateDetailDto;
  wikiSearchKeyword: string;
  selectedWikiResult: WikipediaSearchResultDto | null;
  wikiSearchResults: WikipediaSearchResultDto[];
  wikiSearching: boolean;
  submitting: boolean;
  wikiLoadingTarget: "create" | "edit" | null;
  createPipelineProgress: CreatePipelineProgress;
  categories: CategoryDto[];

  onNewDetailChange: (detail: CreateDetailDto) => void;
  onWikiSearchKeywordChange: (keyword: string) => void;
  onSelectWikipediaResult: (result: WikipediaSearchResultDto) => void;
  onCreateDetail: () => void;
}

const CREATE_PIPELINE_STEPS: Array<{ id: CreatePipelineStep; label: string }> =
  [
    { id: "queued", label: "Gửi yêu cầu lấy dữ liệu từ Wikipedia" },
    { id: "jobs", label: "Khởi tạo cập nhật tài liệu Wikipedia và GraphRAG" },
    { id: "polling", label: "Theo dõi trạng thái xử lý pipeline" },
    { id: "saving", label: "Lưu dữ liệu danh nhân" },
    { id: "completed", label: "Hoàn tất cập nhật" },
  ];

export default function CreateDetailForm({
  newDetail,
  wikiSearchKeyword,
  selectedWikiResult,
  wikiSearchResults,
  wikiSearching,
  submitting,
  wikiLoadingTarget,
  createPipelineProgress,
  categories,
  onNewDetailChange,
  onWikiSearchKeywordChange,
  onSelectWikipediaResult,
  onCreateDetail,
}: CreateDetailFormProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-5 h-px bg-slate-300" />
        <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Cập nhật danh nhân
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Chức năng: chọn danh mục, tìm danh nhân trên Wikipedia và cập nhật trực
        tiếp vào hệ thống.
      </p>
      <div className="space-y-3">
        <select
          value={newDetail.categoryId}
          onChange={(e) =>
            onNewDetailChange({
              ...newDetail,
              categoryId: e.target.value,
            })
          }
          className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="space-y-1.5">
          <input
            type="text"
            value={wikiSearchKeyword}
            onChange={(e) => onWikiSearchKeywordChange(e.target.value)}
            placeholder="Tìm danh nhân trên Wikipedia"
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
          />
          <p className="text-[11px] text-slate-400">
            Gõ ít nhất 2 ký tự để tìm tự động trên Wikipedia.
          </p>
          {wikiSearching && (
            <p className="text-[11px] text-slate-500">
              Đang tìm trên Wikipedia...
            </p>
          )}
        </div>
        <WikipediaSearchResults
          results={wikiSearchResults}
          selectedResultId={selectedWikiResult?.id}
          onSelect={onSelectWikipediaResult}
        />
        <button
          onClick={onCreateDetail}
          disabled={
            !newDetail.categoryId.trim() ||
            submitting ||
            wikiLoadingTarget === "create"
          }
          className="cursor-pointer px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-500 disabled:opacity-60 transition-colors text-sm font-medium"
        >
          {wikiLoadingTarget === "create"
            ? "Đang cập nhật từ Wikipedia..."
            : "Cập nhật"}
        </button>

        {createPipelineProgress.visible && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Tiến trình cập nhật
              </p>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  createPipelineProgress.status === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : createPipelineProgress.status === "error"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {createPipelineProgress.status === "success"
                  ? "Hoàn tất"
                  : createPipelineProgress.status === "error"
                    ? "Lỗi"
                    : "Đang xử lý"}
              </span>
            </div>

            <div className="space-y-2">
              {CREATE_PIPELINE_STEPS.map((step, index) => {
                const activeIndex = CREATE_PIPELINE_STEPS.findIndex(
                  (item) => item.id === createPipelineProgress.step,
                );
                const isDone =
                  index < activeIndex ||
                  (index === activeIndex &&
                    createPipelineProgress.status === "success");
                const isCurrent = index === activeIndex;
                const isRunning =
                  isCurrent && createPipelineProgress.status === "running";
                const isError =
                  isCurrent && createPipelineProgress.status === "error";

                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-2.5 text-xs"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border inline-flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? "bg-emerald-100 border-emerald-300 text-emerald-600"
                          : isError
                            ? "bg-red-100 border-red-300 text-red-700"
                            : isRunning
                              ? "border-slate-300 bg-white"
                              : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          className="w-2.5 h-2.5"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : isRunning ? (
                        <svg
                          className="w-3 h-3 animate-spin text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : isError ? (
                        <span className="text-[9px] font-bold leading-none">
                          ✕
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium leading-none">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    <span
                      className={`${
                        isError
                          ? "text-red-700"
                          : isRunning
                            ? "text-slate-700 font-medium"
                            : isDone
                              ? "text-slate-500"
                              : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              {createPipelineProgress.note}
            </p>
            {createPipelineProgress.error && (
              <p className="text-xs text-red-600 mt-1">
                {createPipelineProgress.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
