"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import { ROUTES } from "@/constants";
import { Document } from "@/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Document["status"]>(
    "all",
  );
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      router.push(ROUTES.LOGIN);
      return;
    }
    setUser(currentUser);
    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Mock data - thay thế bằng API call thực tế
      const mockDocuments: Document[] = [
        {
          id: "1",
          title: "Phạm Nhật Vượng - Hành trình từ mì gói đến ô tô",
          description: "Câu chuyện khởi nghiệp của tỷ phú Phạm Nhật Vượng",
          entrepreneurName: "Phạm Nhật Vượng",
          category: "Công nghiệp",
          content: "Nội dung chi tiết về Phạm Nhật Vượng...",
          tags: ["Vingroup", "VinFast", "Kinh doanh"],
          status: "published",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-20"),
          createdBy: "admin",
        },
        {
          id: "2",
          title: "Trương Gia Bình - Cha đẻ của FPT",
          description: "Lịch sử xây dựng đế chế công nghệ FPT",
          entrepreneurName: "Trương Gia Bình",
          category: "Công nghệ",
          content: "Nội dung chi tiết về Trương Gia Bình...",
          tags: ["FPT", "Công nghệ", "Giáo dục"],
          status: "published",
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-18"),
          createdBy: "admin",
        },
        {
          id: "3",
          title: "Nguyễn Thị Phương Thảo - Nữ tỷ phú hàng không",
          description: "Câu chuyện thành công của CEO VietJet",
          entrepreneurName: "Nguyễn Thị Phương Thảo",
          category: "Hàng không",
          content: "Nội dung chi tiết về Nguyễn Thị Phương Thảo...",
          tags: ["VietJet", "Hàng không", "Nữ danh nhân"],
          status: "draft",
          createdAt: new Date("2024-01-22"),
          updatedAt: new Date("2024-01-22"),
          createdBy: "admin",
        },
      ];

      setDocuments(mockDocuments);

      // Calculate stats
      const stats = {
        total: mockDocuments.length,
        published: mockDocuments.filter((d) => d.status === "published").length,
        draft: mockDocuments.filter((d) => d.status === "draft").length,
        archived: mockDocuments.filter((d) => d.status === "archived").length,
      };
      setStats(stats);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push(ROUTES.LOGIN);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa tài liệu này?")) {
      setDocuments(documents.filter((doc) => doc.id !== id));
      // TODO: API call to delete document
    }
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowAddModal(true);
  };

  const handleStatusChange = (id: string, newStatus: Document["status"]) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id
          ? { ...doc, status: newStatus, updatedAt: new Date() }
          : doc,
      ),
    );
    // TODO: API call to update status
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.entrepreneurName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header with gradient */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo with gradient */}
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Quản lý Tài liệu Danh nhân
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Xin chào,{" "}
                  <span className="font-semibold text-gray-700">
                    {user?.email}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards with gradient accents */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Tổng số tài liệu
                </p>
                <p className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Đã xuất bản
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {stats.published}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Bản nháp
                </p>
                <p className="text-4xl font-bold text-yellow-600">
                  {stats.draft}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Đã lưu trữ
                </p>
                <p className="text-4xl font-bold text-gray-600">
                  {stats.archived}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar with search and filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Đã lưu trữ</option>
              </select>

              <button
                onClick={() => {
                  setSelectedDocument(null);
                  setShowAddModal(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Thêm tài liệu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {doc.title}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{doc.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium">
                            {doc.entrepreneurName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {new Date(doc.updatedAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={doc.status}
                        onChange={(e) =>
                          handleStatusChange(
                            doc.id,
                            e.target.value as Document["status"],
                          )
                        }
                        className={`text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition-all ${
                          doc.status === "published"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : doc.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="archived">Đã lưu trữ</option>
                      </select>

                      <button
                        onClick={() => handleEditDocument(doc)}
                        className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {doc.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "Không tìm thấy tài liệu"
                : "Chưa có tài liệu nào"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bắt đầu thêm tài liệu đầu tiên của bạn"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={() => {
                  setSelectedDocument(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Thêm tài liệu đầu tiên</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all animate-scaleIn">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {selectedDocument
                    ? "Chỉnh sửa tài liệu"
                    : "Thêm tài liệu mới"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Đang phát triển:</strong> Form chi tiết để thêm/chỉnh
                  sửa tài liệu sẽ được triển khai ở đây.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button className="px-6 py-2.5 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                  Lưu tài liệu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
