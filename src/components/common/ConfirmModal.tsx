"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal - Editorial style */}
      <div className="relative bg-white shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scale-in rounded-lg overflow-hidden">
        {/* Header decoration */}
        <div
          className={`h-1 ${variant === "danger" ? "bg-gradient-to-r from-red-300 via-red-500 to-red-300" : "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"}`}
        ></div>

        <div className="p-8">
          {/* Warning Icon for danger variant */}
          {variant === "danger" && (
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className={`w-8 h-px ${variant === "danger" ? "bg-red-200" : "bg-slate-300"}`}
            ></div>
            <h3
              className={`text-lg font-serif font-bold tracking-tight ${variant === "danger" ? "text-red-600" : "text-slate-900"}`}
            >
              {title}
            </h3>
            <div
              className={`w-8 h-px ${variant === "danger" ? "bg-red-200" : "bg-slate-300"}`}
            ></div>
          </div>

          {/* Message */}
          <p className="text-slate-600 text-center text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Buttons - Editorial style */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm tracking-wide border border-slate-200 rounded-lg"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm tracking-wide rounded-lg ${
                variant === "danger"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
