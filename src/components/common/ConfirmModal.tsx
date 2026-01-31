'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
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
      <div className="relative bg-white shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scale-in">
        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"></div>

        <div className="p-8">
          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-slate-300"></div>
            <h3 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <div className="w-8 h-px bg-slate-300"></div>
          </div>

          {/* Message */}
          <p className="text-slate-600 text-center text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Buttons - Editorial style */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm tracking-wide border border-slate-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors text-sm tracking-wide"
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
