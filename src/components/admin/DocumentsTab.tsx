"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import adminService, {
  CategoryDto,
  CreateCategoryDto,
  CreateDetailDto,
  DetailDto,
  UpdateCategoryDto,
  UpdateDetailDto,
} from "@/lib/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";

interface DocumentsTabProps {
  mode?: "all" | "categories" | "details";
}

export default function DocumentsTab({ mode = "all" }: DocumentsTabProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [details, setDetails] = useState<DetailDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wikiLoadingTarget, setWikiLoadingTarget] = useState<
    "create" | "edit" | null
  >(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "detail";
    id: string;
  } | null>(null);

  // Edit modals
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editDetailModalOpen, setEditDetailModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(
    null,
  );
  const [editingDetail, setEditingDetail] = useState<DetailDto | null>(null);

  // Create forms
  const [newCategory, setNewCategory] = useState<CreateCategoryDto>({
    name: "",
    description: "",
  });
  const [newDetail, setNewDetail] = useState<CreateDetailDto>({
    categoryId: "",
    title: "",
    content: "",
    wikipediaUrl: "",
  });

  // Edit forms
  const [editCategoryData, setEditCategoryData] = useState<UpdateCategoryDto>({
    name: "",
    description: "",
  });
  const [editDetailData, setEditDetailData] = useState<UpdateDetailDto>({
    title: "",
    content: "",
    wikipediaUrl: "",
  });

  const showCategoryManagement = mode !== "details";
  const showDetailManagement = mode !== "categories";

  const filteredDetails = useMemo(() => {
    if (selectedCategoryId === "all") return details;
    return details.filter((detail) => detail.categoryId === selectedCategoryId);
  }, [details, selectedCategoryId]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      if (category.id && category.name) {
        map.set(category.id, category.name);
      }
    });
    return map;
  }, [categories]);

  const getDetailCategoryLabel = (detail: DetailDto) => {
    const directName = detail.categoryName?.trim();
    if (directName) return directName;

    if (detail.categoryId) {
      const fallbackName = categoryNameById.get(detail.categoryId)?.trim();
      if (fallbackName) return fallbackName;
    }

    return "Danh mục chưa xác định";
  };

  const showError = (text: string) => setMessage({ type: "error", text });
  const showSuccess = (text: string) => setMessage({ type: "success", text });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [categoriesRes, detailsRes] = await Promise.all([
      adminService.getAdminCategories(),
      adminService.getAdminDetails(),
    ]);

    if (categoriesRes.success && categoriesRes.data) {
      const categoryData = categoriesRes.data;
      setCategories(categoryData);
      if (categoryData.length > 0) {
        setNewDetail((prev) => {
          if (prev.categoryId) return prev;
          return { ...prev, categoryId: categoryData[0].id };
        });
      }
    } else if (categoriesRes.error) {
      setMessage({ type: "error", text: categoriesRes.error });
    }

    if (detailsRes.success && detailsRes.data) {
      setDetails(detailsRes.data);
    } else if (detailsRes.error) {
      setMessage({ type: "error", text: detailsRes.error });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const clearMessageSoon = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  const resolveWikipediaName = (rawInput?: string, fallbackTitle?: string) => {
    const input = (rawInput || "").trim();
    if (!input) return (fallbackTitle || "").trim();

    try {
      const parsed = new URL(input);
      const wikiIndex = parsed.pathname.indexOf("/wiki/");
      if (wikiIndex >= 0) {
        const encoded = parsed.pathname.slice(wikiIndex + 6);
        if (encoded) {
          return decodeURIComponent(encoded).replace(/_/g, " ").trim();
        }
      }
      return input;
    } catch {
      return input;
    }
  };

  const normalizeText = (value?: string | null) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const extractWikipediaResult = (
    responseData?: {
      wikipediaTitle?: string;
      wikipediaExtract?: string;
      wikipediaUrl?: string;
      data?: Record<string, unknown> | null;
    } | null,
  ) => {
    const nested =
      responseData?.data && typeof responseData.data === "object"
        ? (responseData.data as Record<string, unknown>)
        : null;

    const extractedTitle =
      responseData?.wikipediaTitle ||
      (typeof nested?.wikipediaTitle === "string"
        ? nested.wikipediaTitle
        : undefined) ||
      (typeof nested?.title === "string" ? nested.title : undefined);

    const extractedContent =
      responseData?.wikipediaExtract ||
      (typeof nested?.wikipediaExtract === "string"
        ? nested.wikipediaExtract
        : undefined) ||
      (typeof nested?.extract === "string" ? nested.extract : undefined) ||
      (typeof nested?.content === "string" ? nested.content : undefined);

    const extractedUrl =
      responseData?.wikipediaUrl ||
      (typeof nested?.wikipediaUrl === "string"
        ? nested.wikipediaUrl
        : undefined) ||
      (typeof nested?.url === "string" ? nested.url : undefined);

    return {
      extractedTitle,
      extractedContent,
      extractedUrl,
    };
  };

  const handleCreateDetail = async () => {
    const wikiName = resolveWikipediaName(
      newDetail.wikipediaUrl,
      newDetail.title,
    );
    if (!newDetail.categoryId || !newDetail.title.trim()) {
      showError("Vui lòng nhập đủ danh mục và tiêu đề.");
      clearMessageSoon();
      return;
    }

    if (!wikiName) {
      showError("Vui lòng nhập Wikipedia URL hoặc tiêu đề danh nhân.");
      clearMessageSoon();
      return;
    }

    setSubmitting(true);
    setWikiLoadingTarget("create");

    const wikiResponse = await adminService.fetchWikipediaContentForDetail({
      name: wikiName,
      customTitle: newDetail.title.trim() || undefined,
      language: "vi",
      targetPerson: newDetail.title.trim() || wikiName,
    });

    if (!wikiResponse.success || !wikiResponse.data?.success) {
      showError(
        wikiResponse.error ||
          wikiResponse.data?.message ||
          "Không thể lấy dữ liệu từ Wikipedia.",
      );
      setSubmitting(false);
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    const { extractedTitle, extractedContent, extractedUrl } =
      extractWikipediaResult(wikiResponse.data || null);

    const finalTitle = (extractedTitle || newDetail.title || "").trim();
    const finalWikipediaUrl = (
      extractedUrl ||
      newDetail.wikipediaUrl ||
      ""
    ).trim();

    const existingDetail = details.find((detail) => {
      const sameCategory = detail.categoryId === newDetail.categoryId;
      if (!sameCategory) return false;

      const sameTitle =
        normalizeText(detail.title) === normalizeText(finalTitle);
      const sameWikiUrl =
        finalWikipediaUrl &&
        normalizeText(detail.wikipediaUrl) === normalizeText(finalWikipediaUrl);

      return sameTitle || Boolean(sameWikiUrl);
    });

    if (!extractedContent && !existingDetail) {
      showError(
        "Wikipedia chưa trả nội dung đầy đủ. Vui lòng bấm Cập nhật lại sau vài giây để lưu bản ghi chi tiết.",
      );
      setSubmitting(false);
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    const finalContent = (
      extractedContent ||
      newDetail.content ||
      existingDetail?.content ||
      finalTitle
    ).trim();

    const payload = {
      title: finalTitle,
      content: finalContent,
      wikipediaUrl: finalWikipediaUrl || undefined,
    };

    const saveResponse = existingDetail
      ? await adminService.updateAdminDetail(existingDetail.id, payload)
      : await adminService.createAdminDetail({
          categoryId: newDetail.categoryId,
          ...payload,
        });

    if (saveResponse.success) {
      showSuccess(
        extractedContent
          ? existingDetail
            ? "Đã cập nhật danh nhân bằng dữ liệu Wikipedia mới nhất."
            : "Đã tạo danh nhân mới bằng dữ liệu Wikipedia."
          : existingDetail
            ? "Đã lưu cập nhật. Backend chưa trả extract ngay, đang giữ nội dung hiện có."
            : "Đã tạo mới từ thông tin hiện có. Backend chưa trả extract ngay, bạn có thể bấm cập nhật lại sau.",
      );
      setNewDetail((prev) => ({
        ...prev,
        title: "",
        content: "",
        wikipediaUrl: "",
      }));
      await loadData();
    } else {
      showError(saveResponse.error || "Không thể cập nhật danh nhân.");
    }

    setSubmitting(false);
    setWikiLoadingTarget(null);
    clearMessageSoon();
  };

  const handleAutoFillEditFromWikipedia = async () => {
    const wikiName = resolveWikipediaName(
      editDetailData.wikipediaUrl,
      editDetailData.title,
    );
    if (!wikiName) {
      showError("Vui lòng nhập Wikipedia URL hoặc tiêu đề danh nhân.");
      clearMessageSoon();
      return;
    }

    setWikiLoadingTarget("edit");

    const response = await adminService.fetchWikipediaContentForDetail({
      name: wikiName,
      customTitle: editDetailData.title?.trim() || undefined,
      language: "vi",
      targetPerson: editDetailData.title?.trim() || wikiName,
    });

    if (!response.success || !response.data?.success) {
      showError(
        response.error ||
          response.data?.message ||
          "Không thể lấy dữ liệu từ Wikipedia.",
      );
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    const responseData =
      response.data?.data && typeof response.data.data === "object"
        ? (response.data.data as Record<string, unknown>)
        : null;

    const extractedTitle =
      response.data?.wikipediaTitle ||
      (typeof responseData?.wikipediaTitle === "string"
        ? responseData.wikipediaTitle
        : undefined) ||
      (typeof responseData?.title === "string"
        ? responseData.title
        : undefined);

    const extractedContent =
      response.data?.wikipediaExtract ||
      (typeof responseData?.wikipediaExtract === "string"
        ? responseData.wikipediaExtract
        : undefined) ||
      (typeof responseData?.extract === "string"
        ? responseData.extract
        : undefined) ||
      (typeof responseData?.content === "string"
        ? responseData.content
        : undefined);

    const extractedUrl =
      response.data?.wikipediaUrl ||
      (typeof responseData?.wikipediaUrl === "string"
        ? responseData.wikipediaUrl
        : undefined) ||
      (typeof responseData?.url === "string" ? responseData.url : undefined);

    setEditDetailData((prev) => ({
      ...prev,
      title: prev.title || extractedTitle || prev.title,
      content: extractedContent?.trim() || prev.content,
      wikipediaUrl: prev.wikipediaUrl || extractedUrl || prev.wikipediaUrl,
    }));

    showSuccess(
      extractedContent
        ? "Đã lấy dữ liệu từ Wikipedia. Bạn có thể chỉnh lại trước khi lưu."
        : "Đã gửi yêu cầu theo mẫu mới của BE. Nếu nội dung chưa đổ về ngay, vui lòng bấm lưu sau khi backend xử lý xong.",
    );
    setWikiLoadingTarget(null);
    clearMessageSoon();
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name?.trim()) {
      showError("Tên danh mục không được để trống.");
      clearMessageSoon();
      return;
    }

    setSubmitting(true);
    const response = await adminService.createAdminCategory({
      name: newCategory.name.trim(),
      description: newCategory.description?.trim() || undefined,
    });

    if (response.success) {
      showSuccess("Tạo danh mục thành công.");
      setNewCategory({ name: "", description: "" });
      await loadData();
    } else {
      showError(response.error || "Không thể tạo danh mục.");
    }

    setSubmitting(false);
    clearMessageSoon();
  };

  const handleOpenDelete = (type: "category" | "detail", id: string) => {
    setDeleteTarget({ type, id });
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    const response =
      deleteTarget.type === "category"
        ? await adminService.deleteAdminCategory(deleteTarget.id)
        : await adminService.deleteAdminDetail(deleteTarget.id);

    if (response.success) {
      showSuccess(
        deleteTarget.type === "category"
          ? "Xóa danh mục thành công."
          : "Xóa danh nhân thành công.",
      );
      await loadData();
    } else {
      showError(response.error || "Không thể xóa dữ liệu.");
    }

    setSubmitting(false);
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    clearMessageSoon();
  };

  const openEditCategory = (category: CategoryDto) => {
    setEditingCategory(category);
    setEditCategoryData({
      name: category.name || "",
      description: category.description || "",
    });
    setEditCategoryModalOpen(true);
  };

  const openEditDetail = (detail: DetailDto) => {
    setEditingDetail(detail);
    setEditDetailData({
      title: detail.title || "",
      content: detail.content || "",
      wikipediaUrl: detail.wikipediaUrl || "",
    });
    setEditDetailModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!editCategoryData.name?.trim()) {
      showError("Tên danh mục không được để trống.");
      clearMessageSoon();
      return;
    }

    setSubmitting(true);
    const response = await adminService.updateAdminCategory(
      editingCategory.id,
      {
        name: editCategoryData.name.trim(),
        description: editCategoryData.description?.trim() || undefined,
      },
    );

    if (response.success) {
      showSuccess("Cập nhật danh mục thành công.");
      setEditCategoryModalOpen(false);
      setEditingCategory(null);
      await loadData();
    } else {
      showError(response.error || "Không thể cập nhật danh mục.");
    }

    setSubmitting(false);
    clearMessageSoon();
  };

  const handleUpdateDetail = async () => {
    if (!editingDetail) return;
    if (!editDetailData.title?.trim() || !editDetailData.content?.trim()) {
      showError("Tiêu đề và nội dung không được để trống.");
      clearMessageSoon();
      return;
    }

    setSubmitting(true);
    const response = await adminService.updateAdminDetail(editingDetail.id, {
      title: editDetailData.title.trim(),
      content: editDetailData.content.trim(),
      wikipediaUrl: editDetailData.wikipediaUrl?.trim() || undefined,
    });

    if (response.success) {
      showSuccess("Cập nhật danh nhân thành công.");
      setEditDetailModalOpen(false);
      setEditingDetail(null);
      await loadData();
    } else {
      showError(response.error || "Không thể cập nhật danh nhân.");
    }

    setSubmitting(false);
    clearMessageSoon();
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showCategoryManagement && (
        <>
          {/* Category create */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-slate-300" />
              <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Tạo danh mục
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chức năng: thêm, sửa, xóa và theo dõi số lượng danh nhân trong
              từng danh mục.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Tên danh mục"
                className="md:col-span-1 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <input
                type="text"
                value={newCategory.description || ""}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Mô tả ngắn"
                className="md:col-span-1 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <button
                onClick={handleCreateCategory}
                disabled={submitting}
                className="md:col-span-1 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors text-sm font-medium"
              >
                Thêm danh mục
              </button>
            </div>
          </div>

          {/* Category list */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Danh sách danh mục
              </p>
              <span className="text-[11px] text-slate-400">
                {categories.length} danh mục
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-10">
                Chưa có danh mục nào
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {category.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {category.description || "Không có mô tả"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{category.detailCount} danh nhân</span>
                          <span>
                            {new Date(category.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditCategory(category)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Chỉnh sửa danh mục"
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
                          onClick={() =>
                            handleOpenDelete("category", category.id)
                          }
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa danh mục"
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showDetailManagement && (
        <>
          {/* Detail create */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-slate-300" />
              <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Cập nhật danh nhân
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chức năng: thêm danh nhân theo danh mục, chỉnh sửa nội dung và xóa
              bản ghi không còn sử dụng.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={newDetail.categoryId}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newDetail.title}
                onChange={(e) =>
                  setNewDetail((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Tiêu đề danh nhân"
                className="px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <input
                type="text"
                value={newDetail.wikipediaUrl || ""}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    wikipediaUrl: e.target.value,
                  }))
                }
                placeholder="Wikipedia URL (tùy chọn)"
                className="md:col-span-2 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <button
                onClick={handleCreateDetail}
                disabled={submitting || wikiLoadingTarget === "create"}
                className="md:col-span-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors text-sm font-medium"
              >
                {wikiLoadingTarget === "create"
                  ? "Đang cập nhật từ Wikipedia..."
                  : "Cập nhật"}
              </button>
            </div>
          </div>

          {/* Detail list */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Danh sách danh nhân
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Lọc theo danh mục
                </span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-xs text-slate-700"
                >
                  <option value="all">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : filteredDetails.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-slate-400 italic">
                  Không có danh nhân phù hợp bộ lọc
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredDetails.map((detail) => (
                  <div
                    key={detail.id}
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
                              d="M12 6v6h4.5m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {detail.title || "Chưa có tiêu đề"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
                              {getDetailCategoryLabel(detail)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(detail.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            {detail.content || "Không có nội dung"}
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
                          onClick={() => openEditDetail(detail)}
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
                          onClick={() => handleOpenDelete("detail", detail.id)}
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={
          deleteTarget?.type === "category" ? "Xóa danh mục" : "Xóa danh nhân"
        }
        message={
          deleteTarget?.type === "category"
            ? "Bạn có chắc chắn muốn xóa danh mục này? Nếu còn danh nhân liên quan, backend có thể từ chối thao tác này."
            : "Bạn có chắc chắn muốn xóa danh nhân này? Hành động không thể hoàn tác."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />

      {/* Edit category modal */}
      {showCategoryManagement && editCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditCategoryModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-800">
                Chỉnh sửa danh mục
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={editCategoryData.name || ""}
                onChange={(e) =>
                  setEditCategoryData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Tên danh mục"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <textarea
                rows={3}
                value={editCategoryData.description || ""}
                onChange={(e) =>
                  setEditCategoryData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Mô tả"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm resize-y"
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setEditCategoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={submitting}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 text-sm font-medium transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit detail modal */}
      {showDetailManagement && editDetailModalOpen && editingDetail && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditDetailModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-800">
                Chỉnh sửa danh nhân
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={editDetailData.title || ""}
                onChange={(e) =>
                  setEditDetailData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Tiêu đề"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <input
                type="text"
                value={editDetailData.wikipediaUrl || ""}
                onChange={(e) =>
                  setEditDetailData((prev) => ({
                    ...prev,
                    wikipediaUrl: e.target.value,
                  }))
                }
                placeholder="Wikipedia URL"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
              />
              <textarea
                rows={7}
                value={editDetailData.content || ""}
                onChange={(e) =>
                  setEditDetailData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Nội dung"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm resize-y"
              />
              <button
                onClick={handleAutoFillEditFromWikipedia}
                disabled={submitting || wikiLoadingTarget === "edit"}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                {wikiLoadingTarget === "edit"
                  ? "Đang lấy dữ liệu từ Wikipedia..."
                  : "Lấy nội dung từ Wikipedia"}
              </button>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setEditDetailModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateDetail}
                disabled={submitting}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 text-sm font-medium transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
