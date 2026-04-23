"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import adminService, {
  CategoryDto,
  CreateCategoryDto,
  CreateDetailDto,
  DetailDto,
  DetailDtoPagedResult,
  UpdateCategoryDto,
  UpdateDetailDto,
  WikipediaSearchResultDto,
} from "@/lib/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";
import DetailPersonCard from "@/components/admin/DetailPersonCard";
import DetailSearchBar from "@/components/admin/DetailSearchBar";
import WikipediaSearchResults from "@/components/admin/WikipediaSearchResults";
import CreateDetailForm from "@/components/admin/CreateDetailForm";

interface DocumentsTabProps {
  mode?: "all" | "categories" | "details";
}

type CreatePipelineStep =
  | "queued"
  | "jobs"
  | "polling"
  | "saving"
  | "completed";

interface CreatePipelineProgress {
  visible: boolean;
  step: CreatePipelineStep;
  status: "running" | "success" | "error";
  note: string;
  error?: string;
}

const PIPELINE_POLL_INTERVAL_MS = 5000;
const PIPELINE_MAX_WAIT_MS = 8 * 60 * 1000;
const PIPELINE_RECOVERY_MAX_ATTEMPTS = 2;

// Module-level cache to avoid redundant API calls during HMR dev reloads
const _hmrCache: {
  categories?: CategoryDto[];
  details?: DetailDtoPagedResult;
  cacheKey?: string;
  timestamp?: number;
} = {};
const HMR_CACHE_TTL_MS = 15_000; // 15 seconds

interface PipelineWaitResult {
  success: boolean;
  graphCompleted: boolean;
  chunkCompleted: boolean;
  warning?: string;
  error?: string;
}

export default function DocumentsTab({ mode = "all" }: DocumentsTabProps) {
  const DEFAULT_DETAIL_PAGE_SIZE = 10;
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [details, setDetails] = useState<DetailDto[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [detailPageSize, setDetailPageSize] = useState(
    DEFAULT_DETAIL_PAGE_SIZE,
  );
  const [wikiSearchKeyword, setWikiSearchKeyword] = useState("");
  const [selectedWikiResult, setSelectedWikiResult] =
    useState<WikipediaSearchResultDto | null>(null);
  const [wikiSearchResults, setWikiSearchResults] = useState<
    WikipediaSearchResultDto[]
  >([]);
  const [wikiSearching, setWikiSearching] = useState(false);
  const [detailPaging, setDetailPaging] = useState<DetailDtoPagedResult>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: DEFAULT_DETAIL_PAGE_SIZE,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wikiLoadingTarget, setWikiLoadingTarget] = useState<
    "create" | "edit" | null
  >(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [createPipelineProgress, setCreatePipelineProgress] =
    useState<CreatePipelineProgress>({
      visible: false,
      step: "queued",
      status: "running",
      note: "",
    });

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

  const normalizeFormValue = (value?: string | null) => (value || "").trim();

  const showCategoryManagement = mode !== "details";
  const showDetailManagement = mode !== "categories";

  const filteredDetails = useMemo(() => details, [details]);

  const pagingDisplayText = useMemo(() => {
    const total = detailPaging.totalCount || 0;
    if (total === 0 || filteredDetails.length === 0) {
      return "Hiển thị 0-0 trên tổng 0";
    }

    const start = (detailPaging.pageNumber - 1) * detailPaging.pageSize + 1;
    const end = Math.min(start + filteredDetails.length - 1, total);
    return `Hiển thị ${start}-${end} trên tổng ${total}`;
  }, [detailPaging, filteredDetails.length]);

  const normalizeLookupValue = (value?: string | null) =>
    (value || "").trim().toLowerCase();

  const categoryDetailCountMap = useMemo(() => {
    const countsByCategoryId = new Map<string, number>();
    const countsByCategoryName = new Map<string, number>();

    details.forEach((detail) => {
      const detailCategoryId = normalizeLookupValue(detail.categoryId);
      if (detailCategoryId) {
        countsByCategoryId.set(
          detailCategoryId,
          (countsByCategoryId.get(detailCategoryId) || 0) + 1,
        );
      }

      const detailCategoryName = normalizeLookupValue(detail.categoryName);
      if (detailCategoryName) {
        countsByCategoryName.set(
          detailCategoryName,
          (countsByCategoryName.get(detailCategoryName) || 0) + 1,
        );
      }
    });

    const result = new Map<string, number>();
    categories.forEach((category) => {
      const normalizedCategoryId = normalizeLookupValue(category.id);
      const normalizedCategoryName = normalizeLookupValue(category.name);
      const countFromDetailsById = normalizedCategoryId
        ? countsByCategoryId.get(normalizedCategoryId) || 0
        : 0;
      const countFromDetailsByName = normalizedCategoryName
        ? countsByCategoryName.get(normalizedCategoryName) || 0
        : 0;
      const countFromApi = Number(category.detailCount) || 0;

      result.set(
        category.id,
        Math.max(countFromDetailsById, countFromDetailsByName, countFromApi),
      );
    });

    return result;
  }, [categories, details]);

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

  const hasEditDetailChanges = useMemo(() => {
    if (!editingDetail) return false;

    return (
      normalizeFormValue(editDetailData.title) !==
        normalizeFormValue(editingDetail.title) ||
      normalizeFormValue(editDetailData.content) !==
        normalizeFormValue(editingDetail.content) ||
      normalizeFormValue(editDetailData.wikipediaUrl) !==
        normalizeFormValue(editingDetail.wikipediaUrl)
    );
  }, [editingDetail, editDetailData]);

  const showError = (text: string) => setMessage({ type: "error", text });
  const showSuccess = (text: string) => setMessage({ type: "success", text });

  const startCreatePipelineProgress = (note: string) => {
    setCreatePipelineProgress({
      visible: true,
      step: "queued",
      status: "running",
      note,
      error: undefined,
    });
  };

  const updateCreatePipelineProgress = (
    step: CreatePipelineStep,
    note: string,
  ) => {
    setCreatePipelineProgress((prev) => ({
      ...prev,
      visible: true,
      step,
      note,
      status: "running",
      error: undefined,
    }));
  };

  const failCreatePipelineProgress = (
    error: string,
    step: CreatePipelineStep = "polling",
  ) => {
    setCreatePipelineProgress((prev) => ({
      ...prev,
      visible: true,
      step,
      status: "error",
      error,
      note: "Pipeline dừng do lỗi.",
    }));
  };

  const completeCreatePipelineProgress = (note: string) => {
    setCreatePipelineProgress({
      visible: true,
      step: "completed",
      status: "success",
      note,
      error: undefined,
    });
  };

  const loadData = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = `${currentPage}|${detailPageSize}|${selectedCategoryId ?? ""}|${appliedSearchTerm ?? ""}`;
      const now = Date.now();
      const cacheHit =
        !forceRefresh &&
        _hmrCache.cacheKey === cacheKey &&
        _hmrCache.timestamp !== undefined &&
        now - _hmrCache.timestamp < HMR_CACHE_TTL_MS &&
        _hmrCache.categories !== undefined &&
        _hmrCache.details !== undefined;

      if (cacheHit) {
        setCategories(_hmrCache.categories!);
        setDetails(_hmrCache.details!.items);
        setDetailPaging(_hmrCache.details!);
        return;
      }

      setLoading(true);
      const [categoriesRes, detailsRes] = await Promise.all([
        adminService.getAdminCategories(),
        adminService.getAdminDetails({
          pageNumber: currentPage,
          pageSize: detailPageSize,
          categoryId: selectedCategoryId,
          searchTerm: appliedSearchTerm || undefined,
          sortBy: "CreatedAt",
          sortDescending: true,
        }),
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
        setDetails(detailsRes.data.items);
        setDetailPaging(detailsRes.data);

        // Update HMR cache
        _hmrCache.categories = categoriesRes.data ?? undefined;
        _hmrCache.details = detailsRes.data;
        _hmrCache.cacheKey = cacheKey;
        _hmrCache.timestamp = Date.now();
      } else if (detailsRes.error) {
        setMessage({ type: "error", text: detailsRes.error });
      }

      setLoading(false);
    },
    [appliedSearchTerm, currentPage, detailPageSize, selectedCategoryId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const clearMessageSoon = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  const applyDetailSearch = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchInput.trim());
  };

  const clearDetailSearch = () => {
    setSearchInput("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  const resolveWikipediaName = (rawInput?: string, fallbackTitle?: string) => {
    const input = (rawInput || "").trim();
    if (!input) return (fallbackTitle || "").trim();

    try {
      const parsed = new URL(input);

      // Case 1: URL has /wiki/PageTitle format
      if (parsed.pathname.includes("/wiki/")) {
        const wikiIndex = parsed.pathname.indexOf("/wiki/");
        const encoded = parsed.pathname.slice(wikiIndex + 6);
        if (encoded) {
          return decodeURIComponent(encoded).replace(/_/g, " ").trim();
        }
      }

      // Case 2: URL has ?curid=XXXXX format - can't extract title from URL alone, use fallback
      if (parsed.search.includes("curid=")) {
        // Return fallback title since we can't extract from curid-only URL
        return (fallbackTitle || "").trim() || input;
      }

      // Not a URL we recognize, return as-is
      return input;
    } catch {
      // Not a valid URL, return as-is (likely already a page title)
      return input;
    }
  };

  const isWikipediaPayloadSuccess = (payload?: unknown) => {
    if (!payload || typeof payload !== "object") return false;

    const data = payload as Record<string, unknown>;
    const status =
      typeof data.status === "string" ? data.status.toLowerCase() : "";

    if (data.success === true) return true;
    if (status === "success" || status === "ok" || status === "succeeded") {
      return true;
    }

    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;

    return Boolean(
      nested ||
      typeof data.wikipediaExtract === "string" ||
      typeof data.summary === "string",
    );
  };

  const getStatusText = (payload?: unknown) => {
    if (!payload || typeof payload !== "object") return "";

    const data = payload as Record<string, unknown>;
    const directStatus = data.status;
    if (typeof directStatus === "string") {
      return directStatus.toLowerCase();
    }

    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;

    const nestedStatus = nested?.status;
    if (typeof nestedStatus === "string") {
      return nestedStatus.toLowerCase();
    }

    return "";
  };

  const isDoneStatus = (status: string) =>
    ["success", "succeeded", "completed", "done", "finished"].includes(status);

  const isFailedStatus = (status: string) =>
    ["failed", "error", "cancelled", "canceled"].includes(status);

  const isRetryableStatusError = (error?: string) => {
    const text = (error || "").toLowerCase();
    return (
      text.includes("404") ||
      text.includes("not found") ||
      text.includes("queued") ||
      text.includes("failed to fetch job status") ||
      text.includes("timeout") ||
      text.includes("timed out") ||
      text.includes("request was canceled")
    );
  };

  const isTimeoutError = (error?: string) => {
    const text = (error || "").toLowerCase();
    return (
      text.includes("timeout") ||
      text.includes("timed out") ||
      text.includes("request was canceled")
    );
  };

  const isRagStatusBridgeError = (error?: string) => {
    const text = (error || "").toLowerCase();
    return text.includes("failed to fetch job status from rag service");
  };

  const extractJobIdFromText = (value?: string) => {
    if (!value) return "";
    const matched = value.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    return matched?.[1] || "";
  };

  const extractGraphJobId = (payload?: unknown) => {
    if (!payload || typeof payload !== "object") return "";

    const data = payload as Record<string, unknown>;
    if (typeof data.graphRagJobId === "string") return data.graphRagJobId;

    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;

    if (typeof nested?.graphRagJobId === "string") {
      return nested.graphRagJobId;
    }

    if (typeof nested?.jobId === "string") {
      return nested.jobId;
    }

    return "";
  };

  const extractChunkJobId = (payload?: unknown) => {
    if (!payload || typeof payload !== "object") return "";

    const data = payload as Record<string, unknown>;
    if (typeof data.jobId === "string") return data.jobId;
    if (typeof data.job_id === "string") return data.job_id;
    if (Array.isArray(data.jobIds) && typeof data.jobIds[0] === "string") {
      return data.jobIds[0];
    }

    if (typeof data.message === "string") {
      const extracted = extractJobIdFromText(data.message);
      if (extracted) return extracted;
    }

    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    for (const item of jobs) {
      if (!item || typeof item !== "object") continue;
      const job = item as Record<string, unknown>;
      if (typeof job.job_id === "string") return job.job_id;
      if (typeof job.jobId === "string") return job.jobId;
    }

    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;

    if (typeof nested?.job_id === "string") {
      return nested.job_id;
    }
    if (typeof nested?.jobId === "string") {
      return nested.jobId;
    }
    if (Array.isArray(nested?.jobIds) && typeof nested.jobIds[0] === "string") {
      return nested.jobIds[0];
    }

    return "";
  };

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const waitForPipelineSuccess = async (
    graphJobId?: string,
    chunkJobId?: string,
  ): Promise<PipelineWaitResult> => {
    const maxAttempts = Math.ceil(
      PIPELINE_MAX_WAIT_MS / PIPELINE_POLL_INTERVAL_MS,
    );

    let graphCompleted = !graphJobId;
    let chunkCompleted = !chunkJobId;
    let graphFailedReason = "";
    let chunkFailedReason = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (graphJobId && !graphCompleted && !graphFailedReason) {
        const graphStatusRes =
          await adminService.getGraphRagNodeStatus(graphJobId);

        if (graphStatusRes.success) {
          const graphStatus = getStatusText(graphStatusRes.data);
          if (isDoneStatus(graphStatus)) {
            graphCompleted = true;
          } else if (isFailedStatus(graphStatus)) {
            graphFailedReason = "Tạo node GraphRAG thất bại.";
          }
        } else if (!isRetryableStatusError(graphStatusRes.error)) {
          graphFailedReason =
            graphStatusRes.error || "Không lấy được trạng thái GraphRAG.";
        }
      }

      if (chunkJobId && !chunkCompleted && !chunkFailedReason) {
        const chunkStatusRes =
          await adminService.getWikipediaChunkStatus(chunkJobId);

        if (chunkStatusRes.success) {
          const chunkStatus = getStatusText(chunkStatusRes.data);
          if (isDoneStatus(chunkStatus)) {
            chunkCompleted = true;
          } else if (isFailedStatus(chunkStatus)) {
            chunkFailedReason = "Tách chunk cho RAG thất bại.";
          }
        } else if (!isRetryableStatusError(chunkStatusRes.error)) {
          chunkFailedReason =
            chunkStatusRes.error || "Không lấy được trạng thái chunking.";
        }
      }

      const graphSettled = graphCompleted || Boolean(graphFailedReason);
      const chunkSettled = chunkCompleted || Boolean(chunkFailedReason);

      if (graphSettled && chunkSettled) {
        break;
      }

      if (attempt < maxAttempts) {
        await sleep(PIPELINE_POLL_INTERVAL_MS);
      }
    }

    if (!graphCompleted && !graphFailedReason && graphJobId) {
      graphFailedReason = "GraphRAG quá thời gian chờ (8 phút).";
    }

    if (!chunkCompleted && !chunkFailedReason && chunkJobId) {
      chunkFailedReason = "Chunking quá thời gian chờ (8 phút).";
    }

    const warnings = [
      graphCompleted
        ? ""
        : graphFailedReason
          ? `GraphRAG: ${graphFailedReason}`
          : "",
      chunkCompleted
        ? ""
        : chunkFailedReason
          ? `Chunking: ${chunkFailedReason}`
          : "",
    ].filter(Boolean);

    const canProceed = graphCompleted || chunkCompleted;

    if (!canProceed) {
      return {
        success: false,
        graphCompleted,
        chunkCompleted,
        error:
          warnings.join(" | ") || "Cả GraphRAG và chunking đều không hoàn tất.",
      };
    }

    return {
      success: true,
      graphCompleted,
      chunkCompleted,
      warning: warnings.length ? warnings.join(" | ") : undefined,
    };
  };

  const shouldRecoverGraphPipeline = (error?: string) => {
    const text = (error || "").toLowerCase();
    return (
      text.includes("graph") ||
      text.includes("graphrag") ||
      text.includes("không có graphjobid") ||
      text.includes("khong co graphjobid")
    );
  };

  const shouldRecoverChunkPipeline = (error?: string) => {
    const text = (error || "").toLowerCase();
    return (
      text.includes("chunk") ||
      text.includes("rag") ||
      text.includes("không có chunkjobid") ||
      text.includes("khong co chunkjobid")
    );
  };
  const extractWikipediaResult = (
    responseData?: Record<string, unknown> | null,
  ) => {
    const nested =
      responseData?.data && typeof responseData.data === "object"
        ? (responseData.data as Record<string, unknown>)
        : null;
    const deepNested =
      nested?.data && typeof nested.data === "object"
        ? (nested.data as Record<string, unknown>)
        : null;
    const roots = [responseData, nested, deepNested].filter(
      (item): item is Record<string, unknown> => Boolean(item),
    );

    const pickString = (...values: unknown[]) => {
      for (const value of values) {
        if (typeof value === "string" && value.trim()) {
          return value;
        }
      }
      return undefined;
    };

    const extractedTitle = pickString(
      ...roots.flatMap((root) => [root.wikipediaTitle, root.title, root.name]),
    );

    const extractedContent = pickString(
      ...roots.flatMap((root) => [
        root.wikipediaExtract,
        root.extract,
        root.content,
        root.summary,
        root.description,
        root.text,
      ]),
    );

    const extractedUrl = pickString(
      ...roots.flatMap((root) => [root.wikipediaUrl, root.url, root.sourceUrl]),
    );

    return {
      extractedTitle,
      extractedContent,
      extractedUrl,
    };
  };

  const searchWikipediaPerson = async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setSelectedWikiResult(null);
      setWikiSearchResults([]);
      return;
    }

    setWikiSearching(true);
    const response = await adminService.getPersonSummaryDetail({
      entityName: trimmedKeyword,
      language: "vi",
      isAutoSave: false,
    });

    if (response.success && response.data) {
      const results = response.data;
      const normalizedKeyword = trimmedKeyword.toLowerCase();
      const matchedSelection = selectedWikiResult
        ? results.find(
            (item) =>
              item.id === selectedWikiResult.id ||
              (item.title || "").trim().toLowerCase() ===
                (selectedWikiResult.title || "").trim().toLowerCase(),
          )
        : null;
      const nextSelectedResult =
        matchedSelection ||
        results.find(
          (item) => item.title?.trim().toLowerCase() === normalizedKeyword,
        ) ||
        results.find((item) =>
          item.title?.trim().toLowerCase().includes(normalizedKeyword),
        ) ||
        results[0];

      setWikiSearchResults(results);
      setSelectedWikiResult(nextSelectedResult || null);
    } else {
      setSelectedWikiResult(null);
      setWikiSearchResults([]);
      showError(response.error || "Không tìm thấy dữ liệu từ Wikipedia.");
      clearMessageSoon();
    }

    setWikiSearching(false);
  };

  useEffect(() => {
    const keyword = wikiSearchKeyword.trim();

    if (!keyword) {
      setWikiSearching(false);
      setSelectedWikiResult(null);
      setWikiSearchResults([]);
      return;
    }

    if (keyword.length < 2) {
      setWikiSearching(false);
      setSelectedWikiResult(null);
      setWikiSearchResults([]);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      if (isCancelled) return;
      await searchWikipediaPerson(keyword);
    }, 450);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [wikiSearchKeyword]);

  const handleCreateDetail = async () => {
    const pageTitle =
      selectedWikiResult?.title?.trim() || wikiSearchKeyword.trim();
    const wikiName = resolveWikipediaName(
      selectedWikiResult?.wikipediaUrl || pageTitle,
      selectedWikiResult?.title || newDetail.title,
    );
    const categoryId = newDetail.categoryId.trim();
    const selectedTitle = selectedWikiResult?.title?.trim() || "";

    if (!categoryId) {
      showError("Vui lòng chọn danh mục.");
      clearMessageSoon();
      return;
    }

    if (!pageTitle) {
      showError("Vui lòng nhập tên danh nhân để cập nhật từ Wikipedia.");
      clearMessageSoon();
      return;
    }

    setSubmitting(true);
    setWikiLoadingTarget("create");
    startCreatePipelineProgress(
      "Đang gửi yêu cầu tới Wikipedia và dịch vụ xử lý.",
    );

    const [graphResult, ragResult] = await Promise.allSettled([
      adminService.fetchWikipediaContentForDetail({
        name: wikiName,
        customTitle: selectedTitle || newDetail.title.trim() || undefined,
        language: "vi",
        targetPerson: selectedTitle || newDetail.title.trim() || wikiName,
      }),
      adminService.updateDetailFromWikipedia({
        categoryId,
        pageTitle: wikiName,
        language: "vi",
      }),
    ]);

    const graphResponse =
      graphResult.status === "fulfilled" ? graphResult.value : null;
    let ragResponse = ragResult.status === "fulfilled" ? ragResult.value : null;

    if (!ragResponse?.success && isRetryableStatusError(ragResponse?.error)) {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        await sleep(1200);
        const retryResponse = await adminService.updateDetailFromWikipedia({
          categoryId,
          pageTitle: wikiName,
          language: "vi",
        });

        ragResponse = retryResponse;

        if (retryResponse.success) {
          break;
        }

        if (!isRetryableStatusError(retryResponse.error)) {
          break;
        }
      }
    }

    const isGraphSuccess = Boolean(graphResponse?.success);
    const isRagSuccess = Boolean(ragResponse?.success);

    const graphError =
      graphResponse?.error || graphResponse?.data?.message || "";
    const ragError = ragResponse?.error || ragResponse?.data?.message || "";
    const graphJobIdFromError = extractJobIdFromText(graphError);
    const chunkJobIdFromError = extractJobIdFromText(ragError);

    const canContinueGraph = isGraphSuccess || Boolean(graphJobIdFromError);
    const canContinueRag = isRagSuccess || Boolean(chunkJobIdFromError);

    updateCreatePipelineProgress(
      "jobs",
      "Đã nhận phản hồi ban đầu, đang kiểm tra thông tin job.",
    );

    if (!canContinueGraph && !canContinueRag) {
      const timeoutHint =
        canContinueGraph && !canContinueRag && isTimeoutError(ragError)
          ? "GraphRAG da queue thanh cong, nhung update-from-wikipedia dang timeout o BE."
          : "";

      const finalError =
        [
          timeoutHint,
          graphError ? `GraphRAG: ${graphError}` : "",
          ragError ? `UpdateFromWikipedia: ${ragError}` : "",
        ]
          .filter(Boolean)
          .join(" | ") || "Không thể lấy dữ liệu từ Wikipedia.";

      failCreatePipelineProgress(finalError, "jobs");
      showError(finalError);
      setSubmitting(false);
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    let graphJobId =
      extractGraphJobId(graphResponse?.data) || graphJobIdFromError;
    let chunkJobId =
      extractChunkJobId(ragResponse?.data) || chunkJobIdFromError;

    // update-from-wikipedia often provides a single jobId used by both pipelines.
    if (!graphJobId && chunkJobId) {
      graphJobId = chunkJobId;
    }
    if (!chunkJobId && graphJobId) {
      chunkJobId = graphJobId;
    }

    const graphReadyWithoutJob = isGraphSuccess && !graphJobId;
    const chunkReadyWithoutJob = isRagSuccess && !chunkJobId;
    const canSkipPolling = graphReadyWithoutJob && chunkReadyWithoutJob;

    if (!graphJobId && !chunkJobId && !canSkipPolling) {
      const missingJobError =
        "Không lấy được thông tin job để kiểm tra trạng thái pipeline.";
      failCreatePipelineProgress(missingJobError, "jobs");
      showError(missingJobError);
      setSubmitting(false);
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    let pipelineResult: PipelineWaitResult = {
      success: true,
      graphCompleted: graphReadyWithoutJob,
      chunkCompleted: chunkReadyWithoutJob,
    };

    if (!canSkipPolling) {
      updateCreatePipelineProgress(
        "polling",
        "Đang đợi GraphRAG và chunking xử lý xong (tối đa 8 phút).",
      );

      pipelineResult = await waitForPipelineSuccess(graphJobId, chunkJobId);
      if (!pipelineResult.success) {
        for (
          let recoveryAttempt = 1;
          recoveryAttempt <= PIPELINE_RECOVERY_MAX_ATTEMPTS;
          recoveryAttempt += 1
        ) {
          const needGraphRecovery =
            !graphJobId || shouldRecoverGraphPipeline(pipelineResult.error);
          const needChunkRecovery =
            !chunkJobId || shouldRecoverChunkPipeline(pipelineResult.error);

          if (!needGraphRecovery && !needChunkRecovery) {
            break;
          }

          updateCreatePipelineProgress(
            "polling",
            `Pipeline lỗi, đang tự khởi tạo lại job (lần ${recoveryAttempt}/${PIPELINE_RECOVERY_MAX_ATTEMPTS})...`,
          );

          if (needChunkRecovery) {
            const recoveredChunk = await adminService.updateDetailFromWikipedia(
              {
                categoryId,
                pageTitle: wikiName,
                language: "vi",
              },
            );

            if (recoveredChunk.success) {
              ragResponse = recoveredChunk;
              const recoveredChunkJobId =
                extractChunkJobId(recoveredChunk.data) ||
                extractJobIdFromText(recoveredChunk.data?.message);
              if (recoveredChunkJobId) {
                chunkJobId = recoveredChunkJobId;
                if (!graphJobId) {
                  graphJobId = recoveredChunkJobId;
                }
              }
            }
          }

          if (needGraphRecovery) {
            const recoveredGraph =
              await adminService.fetchWikipediaContentForDetail({
                name: wikiName,
                customTitle:
                  selectedTitle || newDetail.title.trim() || undefined,
                language: "vi",
                targetPerson:
                  selectedTitle || newDetail.title.trim() || wikiName,
              });

            if (recoveredGraph.success) {
              const recoveredGraphJobId =
                extractGraphJobId(recoveredGraph.data) ||
                extractJobIdFromText(recoveredGraph.data?.message);
              if (recoveredGraphJobId) {
                graphJobId = recoveredGraphJobId;
                if (!chunkJobId) {
                  chunkJobId = recoveredGraphJobId;
                }
              }
            }
          }

          pipelineResult = await waitForPipelineSuccess(graphJobId, chunkJobId);
          if (pipelineResult.success) {
            break;
          }
        }
      }

      if (!pipelineResult.success) {
        failCreatePipelineProgress(
          pipelineResult.error || "Pipeline xử lý chưa hoàn tất.",
          "polling",
        );
        showError(pipelineResult.error || "Pipeline xử lý chưa hoàn tất.");
        setSubmitting(false);
        setWikiLoadingTarget(null);
        clearMessageSoon();
        return;
      }

      if (pipelineResult.warning) {
        updateCreatePipelineProgress(
          "polling",
          `Pipeline hoàn tất một phần: ${pipelineResult.warning}`,
        );
      }
    } else {
      updateCreatePipelineProgress(
        "polling",
        "Backend không trả jobId, bỏ qua theo dõi trạng thái và tiếp tục lưu dữ liệu.",
      );
    }

    const { extractedTitle, extractedContent, extractedUrl } =
      extractWikipediaResult((graphResponse?.data as any) || null);

    const ragExtract = extractWikipediaResult(
      (ragResponse?.data as any) || null,
    );

    const resolvedTitle = extractedTitle || ragExtract.extractedTitle;
    const resolvedContent = extractedContent || ragExtract.extractedContent;
    const resolvedUrl = extractedUrl || ragExtract.extractedUrl;

    const finalTitle = (
      resolvedTitle ||
      selectedWikiResult?.title ||
      newDetail.title ||
      ""
    ).trim();
    const finalWikipediaUrl = (
      resolvedUrl ||
      selectedWikiResult?.wikipediaUrl ||
      newDetail.wikipediaUrl ||
      ""
    ).trim();

    const existingDetail = details.find((detail) => {
      const sameCategory = detail.categoryId === newDetail.categoryId;
      if (!sameCategory) return false;

      const sameTitle =
        normalizeLookupValue(detail.title) === normalizeLookupValue(finalTitle);
      const sameWikiUrl =
        finalWikipediaUrl &&
        normalizeLookupValue(detail.wikipediaUrl) ===
          normalizeLookupValue(finalWikipediaUrl);

      return sameTitle || Boolean(sameWikiUrl);
    });

    const finalContent = (
      resolvedContent ||
      newDetail.content ||
      existingDetail?.content ||
      finalTitle
    ).trim();

    const payload = {
      title: finalTitle,
      content: finalContent,
      wikipediaUrl: finalWikipediaUrl || undefined,
    };

    updateCreatePipelineProgress(
      "saving",
      "Đang lưu dữ liệu danh nhân vào hệ thống.",
    );

    let saveResponse = existingDetail
      ? await adminService.updateAdminDetail(existingDetail.id, payload)
      : await adminService.createAdminDetail({
          categoryId: newDetail.categoryId,
          ...payload,
        });

    // update-from-wikipedia can delete/recreate the underlying Document;
    // when that happens, existingDetail.id becomes stale and update returns not found.
    if (
      !saveResponse.success &&
      existingDetail &&
      (saveResponse.error || "").toLowerCase().includes("not found")
    ) {
      saveResponse = await adminService.createAdminDetail({
        categoryId: newDetail.categoryId,
        ...payload,
      });
    }

    if (saveResponse.success) {
      completeCreatePipelineProgress(
        existingDetail
          ? "Đã cập nhật danh nhân thành công."
          : "Đã tạo danh nhân thành công.",
      );
      const baseSuccessMessage = existingDetail
        ? "Pipeline hoàn tất, đã cập nhật danh nhân theo lĩnh vực đã chọn."
        : "Pipeline hoàn tất, đã tạo danh nhân theo lĩnh vực đã chọn.";
      showSuccess(
        pipelineResult.warning
          ? `${baseSuccessMessage} Lưu ý: ${pipelineResult.warning}`
          : baseSuccessMessage,
      );
      setWikiSearchKeyword("");
      setSelectedWikiResult(null);
      setWikiSearchResults([]);
      setNewDetail((prev) => ({
        ...prev,
        title: "",
        content: "",
        wikipediaUrl: "",
      }));
      setAppliedSearchTerm("");
      setSearchInput("");
      setCurrentPage(1);
      await loadData(true);
    } else {
      failCreatePipelineProgress(
        saveResponse.error || "Không thể cập nhật danh nhân.",
        "saving",
      );
      showError(saveResponse.error || "Không thể cập nhật danh nhân.");
    }

    setSubmitting(false);
    setWikiLoadingTarget(null);
    clearMessageSoon();
  };

  const handleSelectWikipediaResult = (result: WikipediaSearchResultDto) => {
    setSelectedWikiResult(result);
    setNewDetail((prev) => ({
      ...prev,
      title: result.title || prev.title,
      content: result.content || prev.content,
      wikipediaUrl: result.wikipediaUrl || prev.wikipediaUrl,
    }));
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

    if (!response.success || !isWikipediaPayloadSuccess(response.data)) {
      showError(
        response.error ||
          (typeof response.data?.message === "string"
            ? response.data.message
            : null) ||
          "Không thể lấy dữ liệu từ Wikipedia.",
      );
      setWikiLoadingTarget(null);
      clearMessageSoon();
      return;
    }

    const { extractedTitle, extractedContent, extractedUrl } =
      extractWikipediaResult(
        (response.data as Record<string, unknown> | undefined) || null,
      );

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
      await loadData(true);
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
      await loadData(true);
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
      await loadData(true);
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

    if (!hasEditDetailChanges) {
      showError("Bạn chưa thay đổi thông tin nào để lưu.");
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
      setDetails((prev) =>
        prev.map((d) =>
          d.id === editingDetail.id
            ? {
                ...d,
                title: editDetailData.title?.trim() ?? d.title,
                content: editDetailData.content?.trim() ?? d.content,
                wikipediaUrl:
                  editDetailData.wikipediaUrl?.trim() || d.wikipediaUrl,
              }
            : d,
        ),
      );
      setEditDetailModalOpen(false);
      setEditingDetail(null);
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
                          <span>
                            {categoryDetailCountMap.get(category.id) || 0} danh
                            nhân
                          </span>
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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
          <CreateDetailForm
            newDetail={newDetail}
            wikiSearchKeyword={wikiSearchKeyword}
            selectedWikiResult={selectedWikiResult}
            wikiSearchResults={wikiSearchResults}
            wikiSearching={wikiSearching}
            submitting={submitting}
            wikiLoadingTarget={wikiLoadingTarget}
            createPipelineProgress={createPipelineProgress}
            categories={categories}
            onNewDetailChange={setNewDetail}
            onWikiSearchKeywordChange={setWikiSearchKeyword}
            onSelectWikipediaResult={handleSelectWikipediaResult}
            onCreateDetail={handleCreateDetail}
          />

          {/* Detail list */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Danh sách danh nhân
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Lọc theo danh mục
                </span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-xs text-slate-700"
                >
                  <option value="all">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={detailPageSize}
                  onChange={(e) => {
                    setDetailPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-xs text-slate-700"
                  title="Số bản ghi mỗi trang"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
                <DetailSearchBar
                  searchInput={searchInput}
                  appliedSearchTerm={appliedSearchTerm}
                  onSearchInputChange={setSearchInput}
                  onApply={applyDetailSearch}
                  onClear={clearDetailSearch}
                />
              </div>
              <span className="text-[11px] text-slate-400 text-right">
                {pagingDisplayText}
              </span>
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
                  <DetailPersonCard
                    key={detail.id}
                    detail={detail}
                    categoryLabel={getDetailCategoryLabel(detail)}
                    onEdit={openEditDetail}
                    onDelete={(id) => handleOpenDelete("detail", id)}
                  />
                ))}
              </div>
            )}

            {!loading && detailPaging.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Trang {detailPaging.pageNumber}/{detailPaging.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={!detailPaging.hasPreviousPage || loading}
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(detailPaging.totalPages, prev + 1),
                      )
                    }
                    disabled={!detailPaging.hasNextPage || loading}
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
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
              <p className="text-[11px] text-slate-500 mt-1">
                ID: {editingDetail.id} &middot; Danh mục:{" "}
                {getDetailCategoryLabel(editingDetail)}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Cập nhật tiêu đề, nội dung hoặc đường dẫn Wikipedia rồi bấm Lưu
                thay đổi.
              </p>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editDetailData.title || ""}
                  onChange={(e) =>
                    setEditDetailData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Nhập tiêu đề danh nhân"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Wikipedia URL
                </label>
                <input
                  type="text"
                  value={editDetailData.wikipediaUrl || ""}
                  onChange={(e) =>
                    setEditDetailData((prev) => ({
                      ...prev,
                      wikipediaUrl: e.target.value,
                    }))
                  }
                  placeholder="https://vi.wikipedia.org/wiki/..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  value={editDetailData.content || ""}
                  onChange={(e) =>
                    setEditDetailData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Nhập nội dung tóm tắt danh nhân"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300/50 text-sm resize-y"
                />
              </div>

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
                disabled={submitting || !hasEditDetailChanges}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 text-sm font-medium transition-colors"
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
