import { apiClient, ApiResponse } from './apiClient';
import authService from './authService';
import { ChatModel } from '@/utils/subdomain';
import { MODELS } from '@/constants';

// =====================
// Backend API Types (matching Swagger)
// =====================

// ChatRequest - POST /api/Question
export interface ChatRequest {
  question: string;
  SessionId?: string;
  documentIds?: string[];
  verbose?: boolean;
}

// ChatResponse - response from /api/Question
export interface ChatResponse {
  question: string;
  answer: string;
  sessionId?: string;
  aiModel?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphRagChatRequest {
  question: string;
  sessionId?: string;
}

export interface GraphRagChatResponse {
  success: boolean;
  answer: string | null;
  data?: unknown;
  error?: string | null;
}

// SearchRequest - POST /api/Question/search
export interface SearchRequest {
  query: string;
  topK?: number;
  documentIds?: string[];
  searchType?: string;
  bm25Weight?: number;
  semanticWeight?: number;
}

// SearchResult from backend
export interface SearchResult {
  id: number;
  content: string;
  score: number;
  h1?: string;
  h2?: string;
  h3?: string;
  documentId?: string;
  chunkIndex?: number;
  metadata?: Record<string, unknown>;
}

// SearchResponse
export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  searchType?: string;
}

// DocumentInfo
export interface DocumentInfo {
  id: string;
  filePath?: string;
  fileName?: string;
  sourceType?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  chunkCount?: number;
}

// DocumentUploadResponse
export interface DocumentUploadResponse {
  totalFiles: number;
  results: FileUploadResult[];
}

export interface FileUploadResult {
  filename?: string;
  status?: string;
  jobId?: string;
  documentId?: string;
  message?: string;
}

// JobStatusResponse
export interface JobStatusResponse {
  jobId?: string;
  status?: string;
  message?: string;
  documentId?: string;
  progress?: Record<string, unknown>;
}

// =====================
// UI Message Types (for frontend use)
// =====================
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// =====================
// Chat Service - matching Backend API
// =====================
export const chatService = {
  // Send question to AI - POST /api/Question
  async sendQuestion(
    question: string,
    options?: {
      sessionId?: string;
      documentIds?: string[];
      verbose?: boolean;
      model?: ChatModel;
    }
  ): Promise<ApiResponse<ChatResponse>> {
    if (options?.model === MODELS.GRAPH_RAG) {
      return this.sendGraphRagQuestion(question, options?.sessionId);
    }

    const request: ChatRequest = {
      question,
      SessionId: options?.sessionId,
      documentIds: options?.documentIds,
      verbose: options?.verbose,
    };
    return apiClient.post<ChatResponse>('/Question', request);
  },

  async sendGraphRagQuestion(
    question: string,
    sessionId?: string,
  ): Promise<ApiResponse<ChatResponse>> {
    const request: GraphRagChatRequest = {
      question,
      sessionId,
    };

    const response = await apiClient.post<GraphRagChatResponse>(
      '/graphrag/chat',
      request,
    );

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Không thể kết nối đến GraphRAG',
      };
    }

    if (!response.data.success) {
      return {
        success: false,
        error: response.data.error || 'GraphRAG xử lý thất bại',
      };
    }

    return {
      success: true,
      data: {
        question,
        answer: response.data.answer || 'Không tìm thấy thông tin trong dữ liệu.',
        sessionId,
        aiModel: MODELS.GRAPH_RAG,
      },
    };
  },

  // Search in documents - POST /api/Question/search
  async search(query: string, options?: Partial<SearchRequest>): Promise<ApiResponse<SearchResponse>> {
    const request: SearchRequest = {
      query,
      ...options,
    };
    return apiClient.post<SearchResponse>('/Question/search', request);
  },

  // Upload document - POST /api/Question/upload
  async uploadDocument(file: File, chunkSize?: number, chunkOverlap?: number): Promise<ApiResponse<DocumentUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    if (chunkSize) params.append('chunkSize', chunkSize.toString());
    if (chunkOverlap) params.append('chunkOverlap', chunkOverlap.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const token = authService.getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sep490-8-wikichatbot-backends.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/Question/upload${queryString}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.detail || 'Upload failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi upload file',
      };
    }
  },

  // Get all documents - GET /api/Question/documents
  async getDocuments(skip?: number, limit?: number): Promise<ApiResponse<DocumentInfo[]>> {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<DocumentInfo[]>(`/Question/documents${queryString}`);
  },

  // Get document by ID - GET /api/Question/documents/{documentId}
  async getDocument(documentId: string): Promise<ApiResponse<DocumentInfo>> {
    return apiClient.get<DocumentInfo>(`/Question/documents/${documentId}`);
  },

  // Delete document - DELETE /api/Question/documents/{documentId}
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/Question/documents/${documentId}`);
  },

  // Get job status - GET /api/Question/status/{jobId}
  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
    return apiClient.get<JobStatusResponse>(`/Question/status/${jobId}`);
  },

  // Health check - GET /api/Question/health
  async healthCheck(): Promise<ApiResponse<void>> {
    return apiClient.get<void>('/Question/health');
  },
};

// =====================
// Mock Chat Service (for development)
// =====================
export const mockChatService = {
  async sendQuestion(
    question: string,
    options?: {
      sessionId?: string;
      documentIds?: string[];
      verbose?: boolean;
      model?: ChatModel;
    }
  ): Promise<ApiResponse<ChatResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      data: {
        question,
        answer: `Đây là câu trả lời mẫu cho câu hỏi: "${question}". Trong môi trường production, câu trả lời sẽ được tạo bởi AI từ backend.`,
        sessionId: options?.sessionId || `session-${Date.now()}`,
        metadata: options?.verbose ? { source: 'mock', timestamp: new Date().toISOString() } : undefined,
      },
    };
  },

  async search(query: string, options?: Partial<SearchRequest>): Promise<ApiResponse<SearchResponse>> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        query,
        results: [
          {
            id: 1,
            content: `Kết quả tìm kiếm mẫu cho: "${query}"`,
            score: 0.95,
            h1: 'Tiêu đề mẫu',
            documentId: 'doc-1',
            chunkIndex: 0,
          },
        ],
        total: 1,
        searchType: options?.searchType || 'hybrid',
      },
    };
  },

  async uploadDocument(file: File): Promise<ApiResponse<DocumentUploadResponse>> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      data: {
        totalFiles: 1,
        results: [
          {
            filename: file.name,
            status: 'completed',
            documentId: `doc-${Date.now()}`,
            message: 'Upload thành công',
          },
        ],
      },
    };
  },

  async getDocuments(): Promise<ApiResponse<DocumentInfo[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: [
        {
          id: 'doc-1',
          fileName: 'document-sample.pdf',
          status: 'processed',
          createdAt: new Date().toISOString(),
          chunkCount: 10,
        },
      ],
    };
  },

  async getDocument(documentId: string): Promise<ApiResponse<DocumentInfo>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      data: {
        id: documentId,
        fileName: 'document-sample.pdf',
        status: 'processed',
        createdAt: new Date().toISOString(),
        chunkCount: 10,
      },
    };
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        jobId,
        status: 'completed',
        message: 'Processing completed',
      },
    };
  },

  async healthCheck(): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
  },
};

// Export service to use (switch between real and mock)
// Use chatService for production with backend
// Use mockChatService for development/testing
export default chatService;
