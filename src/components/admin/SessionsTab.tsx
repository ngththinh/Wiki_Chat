"use client";

import { useState, useEffect, useCallback } from "react";
import adminService, { AdminChatSessionDto } from "@/lib/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function SessionsTab() {
  const [sessions, setSessions] = useState<AdminChatSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSessionTarget, setDeleteSessionTarget] = useState<{
    id: number;
    sessionId: string;
  } | null>(null);
  const [deleteUserSessionsModalOpen, setDeleteUserSessionsModalOpen] =
    useState(false);
  const [deleteUserSessionsUserId, setDeleteUserSessionsUserId] = useState<
    number | null
  >(null);

  const loadSessions = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      const response = await adminService.getChatSessions({
        pageNumber: page,
        pageSize: pagination.pageSize,
      });
      if (response.success && response.data) {
        setSessions(response.data.items);
        setPagination({
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
        });
      } else {
        setSessions([]);
        setError(response.error || "Không thể tải danh sách phiên chat");
      }
      setLoading(false);
    },
    [pagination.pageSize],
  );

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = (session: AdminChatSessionDto) => {
    setDeleteSessionTarget({
      id: session.id,
      sessionId: session.sessionId || "",
    });
    setDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (deleteSessionTarget !== null) {
      const identifier =
        deleteSessionTarget.sessionId || deleteSessionTarget.id;
      const response = await adminService.deleteChatSession(identifier);

      if (!response.success) {
        setError(response.error || "Không thể xóa phiên chat");
      }

      await loadSessions(pagination.pageNumber);
    }
    setDeleteModalOpen(false);
    setDeleteSessionTarget(null);
  };

  const handleDeleteUserSessions = (userId: number) => {
    setDeleteUserSessionsUserId(userId);
    setDeleteUserSessionsModalOpen(true);
  };

  const confirmDeleteUserSessions = async () => {
    if (deleteUserSessionsUserId !== null) {
      const response = await adminService.deleteUserChatSessions(
        deleteUserSessionsUserId,
      );

      if (!response.success) {
        setError(response.error || "Không thể xóa phiên chat của người dùng");
      }

      await loadSessions(pagination.pageNumber);
    }
    setDeleteUserSessionsModalOpen(false);
    setDeleteUserSessionsUserId(null);
  };

  return (
    <div className="space-y-4">
      {/* Sessions table */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
        {error && (
          <div className="px-5 pt-4">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
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
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
            <p className="text-sm text-slate-400 italic">
              Không có phiên chat nào
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Phiên
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Người dùng
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium hidden sm:table-cell">
                    Tin nhắn
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium hidden md:table-cell">
                    Ngày tạo
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.map((s, index) => (
                  <tr
                    key={`${s.id}-${s.sessionId || "no-session-id"}-${index}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-45">
                          {s.sessionName || s.sessionId || `Phiên #${s.id}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {s.username || `User #${s.userId}`}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                        {s.messageCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 hidden md:table-cell">
                      {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDeleteUserSessions(s.userId)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Xóa tất cả phiên của user này"
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
                              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa phiên này"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Trang {pagination.pageNumber} / {pagination.totalPages} &middot;{" "}
              {pagination.totalCount} phiên
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.pageNumber <= 1}
                onClick={() => loadSessions(pagination.pageNumber - 1)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                disabled={pagination.pageNumber >= pagination.totalPages}
                onClick={() => loadSessions(pagination.pageNumber + 1)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete single session confirm */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xóa phiên chat"
        message="Bạn có chắc chắn muốn xóa phiên chat này? Hành động không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDeleteSession}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteSessionTarget(null);
        }}
      />

      {/* Delete all user sessions confirm */}
      <ConfirmModal
        isOpen={deleteUserSessionsModalOpen}
        title="Xóa tất cả phiên chat"
        message="Bạn có chắc chắn muốn xóa TẤT CẢ phiên chat của người dùng này?"
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDeleteUserSessions}
        onCancel={() => {
          setDeleteUserSessionsModalOpen(false);
          setDeleteUserSessionsUserId(null);
        }}
      />
    </div>
  );
}
