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
