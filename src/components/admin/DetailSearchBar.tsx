"use client";

interface DetailSearchBarProps {
  searchInput: string;
  appliedSearchTerm: string;
  onSearchInputChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function DetailSearchBar({
  searchInput,
  appliedSearchTerm,
  onSearchInputChange,
  onApply,
  onClear,
}: DetailSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onApply();
          }
        }}
        placeholder="Tìm danh nhân..."
        className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-xs text-slate-700 w-40 sm:w-52"
      />
      <button
        onClick={onApply}
        className="px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        Tìm
      </button>
      {appliedSearchTerm && (
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Xóa lọc
        </button>
      )}
    </div>
  );
}
