"use client";

import { DetailDto } from "@/lib/adminService";

interface DetailPersonCardProps {
  detail: DetailDto;
  categoryLabel: string;
  onEdit: (detail: DetailDto) => void;
  onDelete: (id: string) => void;
}

export default function DetailPersonCard({
  detail,
  categoryLabel,
  onEdit,
  onDelete,
}: DetailPersonCardProps) {
  return (
    <div className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-30 items-start gap-3 min-w-0 flex-1">
          {detail.thumbnailUrl ? (
            <img
              src={detail.thumbnailUrl}
              alt={detail.title || "Thumbnail danh nhân"}
              className="h-full aspect-square rounded-lg object-cover border border-slate-200 shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="h-full aspect-square rounded-lg border border-dashed border-slate-300 bg-slate-100 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700 truncate">
              {detail.title || "Chưa có tiêu đề"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
                {categoryLabel}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
              {detail.description || detail.content || "Không có nội dung"}
            </p>
            {detail.wikipediaUrl && (
              <p className="text-[11px] text-blue-600 mt-1 truncate">
                {detail.wikipediaUrl}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(detail)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Chỉnh sửa danh nhân"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(detail.id)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa danh nhân"
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
          </button>
        </div>
      </div>
    </div>
  );
}
