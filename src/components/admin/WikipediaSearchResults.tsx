"use client";

import { WikipediaSearchResultDto } from "@/lib/adminService";

interface WikipediaSearchResultsProps {
  results: WikipediaSearchResultDto[];
  selectedResultId?: string;
  onSelect: (result: WikipediaSearchResultDto) => void;
}

export default function WikipediaSearchResults({
  results,
  selectedResultId,
  onSelect,
}: WikipediaSearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      {results.map((result) => {
        const isActive = selectedResultId === result.id;

        return (
          <button
            key={result.id}
            type="button"
            onClick={() => onSelect(result)}
            className={`w-full cursor-pointer h-30 rounded-lg border text-left transition-colors ${
              isActive
                ? "border-slate-400 bg-slate-200"
                : "border-slate-200 bg-white/80 hover:bg-gray-300"
            }`}
          >
            <div className="flex w-full h-full items-start">
              {result.thumbnailUrl ? (
                <img
                  src={result.thumbnailUrl}
                  alt={result.title || "Wikipedia thumbnail"}
                  className="h-full aspect-square rounded object-cover border border-slate-200"
                  loading="lazy"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-[0.75rem] italic aspect-square shrink-0 rounded border border-dashed border-slate-300 bg-slate-200">
                  Không có ảnh
                </div>
              )}
              <div className="min-w-0 px-2 py-1 flex-1">
                <p className="text-base text-[1.1rem] font-semibold text-slate-700">
                  {result.title || "Không có tiêu đề"}
                </p>
                <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                  {result.content || "Không có mô tả từ Wikipedia."}
                </p>
                {result.wikipediaUrl && (
                  <a
                    href={result.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-[12px] text-blue-600 truncate hover:underline"
                  >
                    {result.wikipediaUrl}
                  </a>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
