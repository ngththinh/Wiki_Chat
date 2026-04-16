"use client";

import { useState, useEffect, useCallback } from "react";
import adminService, { AdminUserDto } from "@/lib/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function UsersTab() {
  const LOCAL_FETCH_PAGE_SIZE = 100;
  const SEARCH_THRESHOLD = 2;

  const [allUsers, setAllUsers] = useState<AdminUserDto[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    role: "",
  });

  const normalizeRoleForApi = (value?: string) => {
    if (!value) return undefined;

    const normalized = value.toLowerCase();
    if (normalized === "admin") return "Admin";
    if (normalized === "user") return "User";
    return undefined;
  };

  const applyLocalFiltersAndPagination = useCallback(
    (
      sourceUsers: AdminUserDto[],
      page: number = 1,
      options?: { searchTerm?: string; roleFilter?: string },
    ) => {
      const effectiveSearchTerm = (options?.searchTerm ?? searchTerm)
        .trim()
        .toLowerCase();
      const shouldApplySearch = effectiveSearchTerm.length >= SEARCH_THRESHOLD;
      const effectiveRoleFilter = options?.roleFilter ?? roleFilter;
      const normalizedRoleFilter =
        effectiveRoleFilter !== "all"
          ? normalizeRoleForApi(effectiveRoleFilter)?.toLowerCase()
          : undefined;

      const filtered = sourceUsers.filter((user) => {
        const roleMatched = normalizedRoleFilter
          ? user.role?.toLowerCase() === normalizedRoleFilter
          : true;

        if (!roleMatched) {
          return false;
        }

        if (!effectiveSearchTerm || !shouldApplySearch) {
          return true;
        }

        const searchText = `${user.username || ""} ${user.email || ""} ${
          user.fullName || ""
        }`.toLowerCase();

        return searchText.includes(effectiveSearchTerm);
      });

      const totalCount = filtered.length;
      const totalPages =
        totalCount === 0 ? 0 : Math.ceil(totalCount / pagination.pageSize);
      const safePage =
        totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
      const startIndex = (safePage - 1) * pagination.pageSize;

      setUsers(filtered.slice(startIndex, startIndex + pagination.pageSize));
      setPagination((prev) => ({
        ...prev,
        pageNumber: safePage,
        totalCount,
        totalPages,
      }));
    },
    [searchTerm, roleFilter, pagination.pageSize],
  );

  const fetchAllUsers = useCallback(async () => {
    let page = 1;
    let totalPages = 1;
    const collectedUsers: AdminUserDto[] = [];

    while (page <= totalPages) {
      const response = await adminService.getUsers({
        pageNumber: page,
        pageSize: LOCAL_FETCH_PAGE_SIZE,
      });

      if (!response.success || !response.data) {
        setError(response.error || "Không thể tải danh sách người dùng");
        return null;
      }

      collectedUsers.push(...response.data.items);
      totalPages = response.data.totalPages || 1;
      page += 1;
    }

    return collectedUsers;
  }, []);

  const loadUsers = useCallback(
    async (
      page: number = 1,
      options?: {
        searchTerm?: string;
        roleFilter?: string;
        forceReload?: boolean;
      },
    ) => {
      setError(null);

      let sourceUsers = allUsers;

      if (options?.forceReload || allUsers.length === 0) {
        setLoading(true);
        const fetchedUsers = await fetchAllUsers();
        setLoading(false);

        if (!fetchedUsers) {
          setUsers([]);
          setPagination((prev) => ({
            ...prev,
            pageNumber: 1,
            totalCount: 0,
            totalPages: 0,
          }));
          return;
        }

        sourceUsers = fetchedUsers;
        setAllUsers(fetchedUsers);
      }

      applyLocalFiltersAndPagination(sourceUsers, page, {
        searchTerm: options?.searchTerm,
        roleFilter: options?.roleFilter,
      });
    },
    [allUsers, fetchAllUsers, applyLocalFiltersAndPagination],
  );

  useEffect(() => {
    loadUsers(1, { forceReload: true });
    // Run only once on mount to avoid refetch loop when callback deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allUsers.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      loadUsers(1, { searchTerm, roleFilter });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, allUsers, loadUsers]);

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteUserId) {
      const response = await adminService.deleteUser(deleteUserId);
      if (!response.success) {
        setError(response.error || "Không thể xóa người dùng");
      } else {
        await loadUsers(pagination.pageNumber, { forceReload: true });
      }
    }
    setDeleteModalOpen(false);
    setDeleteUserId(null);
  };

  const handleEditUser = (user: AdminUserDto) => {
    setSelectedUser(user);
    setEditData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "User",
    });
    setEditModalOpen(true);
  };

  const confirmEdit = async () => {
    if (selectedUser) {
      const response = await adminService.updateUser(selectedUser.id, editData);
      if (!response.success) {
        setError(response.error || "Không thể cập nhật người dùng");
      } else {
        await loadUsers(pagination.pageNumber, { forceReload: true });
      }
    }
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    const response = await adminService.updateUserRole(
      userId,
      normalizeRoleForApi(newRole) || newRole,
    );

    if (!response.success) {
      setError(response.error || "Không thể thay đổi vai trò người dùng");
      return;
    }

    await loadUsers(pagination.pageNumber, { forceReload: true });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsers(1)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm text-slate-700"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <button
            onClick={() => loadUsers(1, { forceReload: true })}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            Làm mới
          </button>
        </div>
        {searchTerm.trim().length > 0 &&
          searchTerm.trim().length < SEARCH_THRESHOLD && (
            <p className="mt-2 text-xs text-slate-500">
              Nhập ít nhất {SEARCH_THRESHOLD} ký tự để tìm kiếm.
            </p>
          )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {/* Users Table */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="text-sm text-slate-400 italic">
              Không tìm thấy người dùng nào
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Người dùng
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Vai trò
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-400 font-medium hidden lg:table-cell">
                    Ngày tạo
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-serif text-sm">
                          {u.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {u.username}
                          </p>
                          <p className="text-[11px] text-slate-400 md:hidden">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                          u.role?.toLowerCase() === "admin"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
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
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
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
              {pagination.totalCount} người dùng
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.pageNumber <= 1}
                onClick={() => loadUsers(pagination.pageNumber - 1)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                disabled={pagination.pageNumber >= pagination.totalPages}
                onClick={() => loadUsers(pagination.pageNumber + 1)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteUserId(null);
        }}
      />

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-800">
                Chỉnh sửa người dùng
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                @{selectedUser.username}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) =>
                    setEditData({ ...editData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Vai trò
                </label>
                <select
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({ ...editData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 text-sm"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
