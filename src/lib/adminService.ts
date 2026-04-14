import authService from './authService';

// Admin API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Debug log
console.log('🔧 Admin API Base URL:', API_BASE_URL);

// Types matching backend DTOs
export interface AdminUserDto {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDtoPagedResult {
  items: AdminUserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminChatSessionDto {
  id: number;
  userId: number;
  username: string | null;
  sessionId: string;
  sessionName: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChatSessionDtoPagedResult {
  items: AdminChatSessionDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminStatsDto {
  totalUsers: number;
  totalChatSessions: number;
  totalChatMessages: number;
  totalAdmins: number;
  totalRegularUsers: number;
  dailyStats: DailyStatsDto[];
}

export interface DailyStatsDto {
  date: string;
  newUsers: number;
  newChatSessions: number;
  newMessages: number;
}

export interface CategoryDto {
  id: string;
  name: string | null;
  description: string | null;
  detailCount: number;
  createdAt: string;
}

export interface CategoryListDto {
  id: string;
  name: string | null;
  description: string | null;
  createdAt: string;
}

export interface DetailDto {
  id: string;
  title: string | null;
  content: string | null;
  wikipediaUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
}

export interface WikipediaPersonSummaryRequestDto {
  entityName: string;
  language?: string;
  isAutoSave?: boolean;
}

export interface WikipediaPersonSummaryDataDto {
  name?: string | null;
  summary?: string | null;
  sourceUrl?: string | null;
  extractedDate?: string | null;
}

export interface WikipediaPersonSummaryResponseDto {
  status?: string;
  data?: WikipediaPersonSummaryDataDto | null;
  message?: string | null;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CreateDetailDto {
  categoryId: string;
  title: string;
  content: string;
  wikipediaUrl?: string;
}

export interface UpdateDetailDto {
  title?: string;
  content?: string;
  wikipediaUrl?: string;
}

export interface WikipediaGenerateNodeRequestDto {
  name: string;
  customTitle?: string;
  language?: string;
  targetPerson?: string;
}

export interface WikipediaGenerateNodeResponseDto {
  success: boolean;
  message?: string;
  graphRagJobId?: string;
  ragDocumentId?: string;
  data?: Record<string, unknown> | null;

  // Some deployments may still include these fields directly.
  wikipediaTitle?: string;
  wikipediaExtract?: string;
  wikipediaUrl?: string;
}

export interface WikipediaDocumentRequestDto {
  name: string;
  customTitle?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  language?: string;
}

export interface WikipediaDocumentResponseDto {
  success: boolean;
  message?: string;
  documentId?: string;
  jobId?: string;
  batch_id?: string;
  jobs?: Array<Record<string, unknown>>;
  wikipediaTitle?: string;
  wikipediaExtract?: string;
  wikipediaUrl?: string;
}

export interface GraphRagNodeStatusResponseDto {
  jobId?: string | null;
  status?: string | null;
  message?: string | null;
  [key: string]: unknown;
}

export interface WikipediaChunkStatusResponseDto {
  job_id?: string | null;
  status?: string | null;
  message?: string | null;
  error?: string | null;
  [key: string]: unknown;
}

export interface DocumentInfo {
  id: string;
  file_path: string | null;
  file_name: string | null;
  source_type: string | null;
  status: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  chunk_count: number | null;
}

export interface DocumentUploadResponse {
  total_files: number;
  results: FileUploadResult[];
}

export interface FileUploadResult {
  filename: string | null;
  status: string | null;
  job_id: string | null;
  document_id: string | null;
  message: string | null;
}

export interface JobStatusResponse {
  jobId: string | null;
  status: string | null;
  message: string | null;
  documentId: string | null;
  progress: Record<string, any> | null;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: string;
}

export interface UpdateUserRoleDto {
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to get auth header
const getAuthHeaders = () => {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const getPublicHeaders = (): Record<string, string> => ({
  'Accept': 'application/json',
});

// Helper to safely parse JSON from response (handles empty/non-JSON bodies)
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const adminService = {
  // ==================== STATS ====================
  
  // Get admin statistics
  async getStats(): Promise<ApiResponse<AdminStatsDto>> {
    try {
      const url = `${API_BASE_URL}/admin/stats`;
      console.log('📊 Fetching stats from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📊 Stats response status:', response.status);

      if (!response.ok) {
        const data = await safeJsonParse(response);
        console.error('📊 Stats error:', response.status, data);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy thống kê (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      console.log('📊 Stats data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('📊 Stats fetch error:', error);
      return { success: false, error: `Lỗi kết nối server: ${error}` };
    }
  },

  // Get daily stats
  async getDailyStats(days: number = 7): Promise<ApiResponse<DailyStatsDto[]>> {
    try {
      const url = `${API_BASE_URL}/admin/stats/daily?days=${days}`;
      console.log('📈 Fetching daily stats from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📈 Daily stats response status:', response.status);

      if (!response.ok) {
        const data = await safeJsonParse(response);
        console.error('📈 Daily stats error:', response.status, data);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy thống kê (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      console.log('📈 Daily stats data:', data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== USERS ====================
  
  // Get users with pagination
  async getUsers(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    role?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<AdminUserDtoPagedResult>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params?.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
      if (params?.role) queryParams.append('Role', params.role);
      if (params?.sortBy) queryParams.append('SortBy', params.sortBy);
      if (params?.sortDescending !== undefined) queryParams.append('SortDescending', params.sortDescending.toString());

      const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh sách người dùng (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get single user
  async getUser(userId: number): Promise<ApiResponse<AdminUserDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy thông tin người dùng (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Update user
  async updateUser(userId: number, updateData: UpdateUserDto): Promise<ApiResponse<AdminUserDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi cập nhật người dùng (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete user
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || 'Lỗi xóa người dùng' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Update user role
  async updateUserRole(userId: number, role: string): Promise<ApiResponse<AdminUserDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role } as UpdateUserRoleDto),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi cập nhật quyền (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== CHAT SESSIONS ====================
  
  // Get chat sessions with pagination
  async getChatSessions(params?: {
    pageNumber?: number;
    pageSize?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<AdminChatSessionDtoPagedResult>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params?.userId) queryParams.append('UserId', params.userId.toString());
      if (params?.startDate) queryParams.append('StartDate', params.startDate);
      if (params?.endDate) queryParams.append('EndDate', params.endDate);
      if (params?.sortBy) queryParams.append('SortBy', params.sortBy);
      if (params?.sortDescending !== undefined) queryParams.append('SortDescending', params.sortDescending.toString());

      const url = `${API_BASE_URL}/admin/chat-sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh sách phiên chat (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get single chat session
  async getChatSession(sessionId: number): Promise<ApiResponse<AdminChatSessionDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chat-sessions/${sessionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy thông tin phiên chat (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete chat session
  async deleteChatSession(sessionId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chat-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || 'Lỗi xóa phiên chat' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete all chat sessions for a user
  async deleteUserChatSessions(userId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/chat-sessions`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || 'Lỗi xóa phiên chat' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== CATEGORIES (PUBLIC) ====================

  // Get public categories
  async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh mục (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get public landing categories
  async getLandingCategories(limit: number = 10): Promise<ApiResponse<CategoryListDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Category/landing?limit=${limit}`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh mục landing (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get detail by id
  async getDetail(detailId: string): Promise<ApiResponse<DetailDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Detail/${detailId}`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy chi tiết danh nhân (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get person detail by name from Wikipedia summary endpoint
  async getPersonSummaryDetail(
    payload: WikipediaPersonSummaryRequestDto,
  ): Promise<ApiResponse<DetailDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wikipedia/person-summary`, {
        method: 'POST',
        headers: getPublicHeaders(),
        body: JSON.stringify({
          entityName: payload.entityName,
          language: payload.language || 'vi',
          isAutoSave: payload.isAutoSave ?? false,
        }),
      });

      const rawData = (await safeJsonParse(response)) as WikipediaPersonSummaryResponseDto | null;

      if (!response.ok) {
        return {
          success: false,
          error:
            rawData?.message ||
            `Lỗi lấy chi tiết danh nhân (HTTP ${response.status})`,
        };
      }

      const personSummary = rawData?.data;
      if (!personSummary) {
        return { success: false, error: 'Không có dữ liệu chi tiết danh nhân' };
      }

      const mappedDetail: DetailDto = {
        id: payload.entityName,
        title: personSummary.name || payload.entityName,
        content: personSummary.summary || null,
        wikipediaUrl: personSummary.sourceUrl || null,
        categoryId: null,
        categoryName: null,
        createdAt: personSummary.extractedDate || new Date().toISOString(),
      };

      return { success: true, data: mappedDetail };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get details by category id
  async getDetailsByCategory(categoryId: string): Promise<ApiResponse<DetailDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Detail/category/${categoryId}`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh sách danh nhân (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== ADMIN CATEGORIES ====================

  // Get admin categories
  async getAdminCategories(): Promise<ApiResponse<CategoryDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh mục admin (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Create admin category
  async createAdminCategory(payload: CreateCategoryDto): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi tạo danh mục (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Update admin category
  async updateAdminCategory(categoryId: string, payload: UpdateCategoryDto): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi cập nhật danh mục (HTTP ${response.status})` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete admin category
  async deleteAdminCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi xóa danh mục (HTTP ${response.status})` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== ADMIN DETAILS ====================

  // Get admin details
  async getAdminDetails(): Promise<ApiResponse<DetailDto[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/details`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh nhân admin (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Create admin detail
  async createAdminDetail(payload: CreateDetailDto): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/details`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi tạo danh nhân (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Update admin detail
  async updateAdminDetail(detailId: string, payload: UpdateDetailDto): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/details/${detailId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi cập nhật danh nhân (HTTP ${response.status})` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Fetch and normalize content from Wikipedia for admin detail edit/create flows
  async fetchWikipediaContentForDetail(
    payload: WikipediaGenerateNodeRequestDto,
  ): Promise<ApiResponse<WikipediaGenerateNodeResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wikipedia/generate-node`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.detail ||
            `Lỗi lấy dữ liệu Wikipedia (HTTP ${response.status})`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Trigger RAG document creation/chunking from Wikipedia.
  async createRagDocumentFromWikipedia(
    payload: WikipediaDocumentRequestDto,
  ): Promise<ApiResponse<WikipediaDocumentResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wikipedia/chunking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.detail ||
            `Lỗi tách chunk từ Wikipedia (HTTP ${response.status})`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Check GraphRAG node creation status
  async getGraphRagNodeStatus(
    jobId: string,
  ): Promise<ApiResponse<GraphRagNodeStatusResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/graphrag/node-status/${jobId}`, {
        method: 'GET',
        headers: getPublicHeaders(),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.detail ||
            `Lỗi kiểm tra trạng thái GraphRAG (HTTP ${response.status})`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Check wikipedia chunking status
  async getWikipediaChunkStatus(
    jobId: string,
  ): Promise<ApiResponse<WikipediaChunkStatusResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wikipedia/chunk-status/${jobId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.detail ||
            `Lỗi kiểm tra trạng thái chunking (HTTP ${response.status})`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete admin detail
  async deleteAdminDetail(detailId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/details/${detailId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi xóa danh nhân (HTTP ${response.status})` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== DOCUMENTS ====================
  
  // Get documents list
  async getDocuments(skip: number = 0, limit: number = 100): Promise<ApiResponse<DocumentInfo[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Question/documents?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy danh sách tài liệu (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get single document
  async getDocument(documentId: string): Promise<ApiResponse<DocumentInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Question/documents/${documentId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy thông tin tài liệu (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Question/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || 'Lỗi xóa tài liệu' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Upload document
  async uploadDocument(file: File, chunkSize: number = 800, chunkOverlap: number = 150): Promise<ApiResponse<DocumentUploadResponse>> {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE_URL}/Question/upload?chunkSize=${chunkSize}&chunkOverlap=${chunkOverlap}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi upload tài liệu (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Get job status
  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Question/status/${jobId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await safeJsonParse(response);
        return { success: false, error: data?.message || data?.detail || `Lỗi lấy trạng thái (HTTP ${response.status})` };
      }

      const data = await safeJsonParse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // ==================== HEALTH ====================
  
  // Check admin health
  async checkHealth(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/health`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Admin service không hoạt động' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },

  // Check Question service health
  async checkQuestionHealth(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Question/health`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Question service không hoạt động' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  },
};

export default adminService;
