"use client";

import { useState, useEffect, useRef } from "react";
import adminService, { DocumentInfo } from "@/lib/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Job status polling
  const [pollingJobs, setPollingJobs] = useState<
    Map<string, { status: string; fileName: string }>
  >(new Map());

  const loadDocuments = async () => {
    setLoading(true);
    const response = await adminService.getDocuments();
    if (response.success && response.data) {
      setDocuments(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress("Đang upload...");

    const response = await adminService.uploadDocument(file);
    if (response.success && response.data) {
      setUploadProgress("Upload thành công!");

      // Start polling for job status if there's a job_id
      if (response.data.results && response.data.results.length > 0) {
        const newJobs = new Map(pollingJobs);
        response.data.results.forEach((result) => {
          if (result.job_id) {
            newJobs.set(result.job_id, {
              status: result.status || "processing",
              fileName: result.filename || file.name,
            });
          }
        });
        setPollingJobs(newJobs);
      }

      setTimeout(() => {
        setUploadProgress(null);
        setUploading(false);
        loadDocuments();
      }, 2000);
    } else {
      setUploadProgress(`Lỗi: ${response.error}`);
      setTimeout(() => {
        setUploadProgress(null);
        setUploading(false);
      }, 3000);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (docId: string) => {
    setDeleteDocId(docId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteDocId) {
      await adminService.deleteDocument(deleteDocId);
      loadDocuments();
    }
    setDeleteModalOpen(false);
    setDeleteDocId(null);
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getFileIcon = (fileName: string | null) => {
    if (!fileName)
      return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z";
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf")
      return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z";
    return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z";
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-700 mb-1">
              Upload Danh Nhân
            </h3>
            <p className="text-[11px] text-slate-400">
              Hỗ trợ PDF, TXT, DOCX. Dữ liệu danh nhân sẽ được xử lý và chia
              thành các đoạn text.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {uploadProgress && (
              <span
                className={`text-xs font-medium ${
                  uploadProgress.includes("Lỗi")
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {uploadProgress}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleUpload}
              className="hidden"
              id="doc-upload"
              disabled={uploading}
            />
            <label
              htmlFor="doc-upload"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                uploading
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
              ) : (
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
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              )}
              {uploading ? "Đang upload..." : "Chọn file"}
            </label>
          </div>
        </div>
      </div>

      {/* Documents list */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-12 h-12 text-slate-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-sm text-slate-400 italic">
              Chưa có danh nhân nào
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={getFileIcon(doc.file_name)}
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {doc.file_name || doc.id}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusStyle(doc.status)}`}
                        >
                          {doc.status || "unknown"}
                        </span>
                        {doc.chunk_count != null && (
                          <span className="text-[10px] text-slate-400">
                            {doc.chunk_count} chunks
                          </span>
                        )}
                        {doc.source_type && (
                          <span className="text-[10px] text-slate-400">
                            {doc.source_type}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xóa danh nhân"
        message="Bạn có chắc chắn muốn xóa danh nhân này? Hành động không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteDocId(null);
        }}
      />
    </div>
  );
}
