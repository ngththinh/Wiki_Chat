// Common types used across the application
// Updated to match Backend API (Swagger)

// =====================
// User Types (matching backend UserDto)
// =====================
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}

// Legacy User type for backwards compatibility
export interface LegacyUser {
  id: string;
  email: string;
  name?: string;
  role?: "guest" | "user" | "admin";
}

// =====================
// API Response Types
// =====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =====================
// Auth Types (matching backend LoginDto, RegisterDto, LoginResponseDto)
// =====================
export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  email: string;
  fullName?: string;
}

export interface LoginResponseDto {
  token: string;
  user: User;
}

// Legacy types for backwards compatibility
export interface LoginResponse extends LoginResponseDto {}
export interface RegisterResponse extends LoginResponseDto {}

// =====================
// Chat Types (matching backend ChatRequest, ChatResponse)
// =====================
export type ChatModel = "RAG" | "GraphRAG";

export interface ChatRequest {
  question: string;
  SessionId?: string;
  sessionId?: string;
  documentIds?: string[];
  verbose?: boolean;
}

export interface ChatResponse {
  question: string;
  answer: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

// UI Message type for frontend
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  metadata?: Record<string, unknown>;
}

// =====================
// Session/Conversation Types (matching backend)
// =====================
export interface ChatSessionDto {
  sessionId: string;
  sessionName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummaryDto {
  sessionId: string;
  sessionName: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ChatHistoryDto {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  createdAt: string;
}

// Legacy Conversation type for UI
export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  pinned: boolean;
  lastMessage?: string;
  messageCount?: number;
}

// =====================
// Search Types (matching backend)
// =====================
export interface SearchRequest {
  query: string;
  topK?: number;
  documentIds?: string[];
  searchType?: string;
  bm25Weight?: number;
  semanticWeight?: number;
}

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

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  searchType?: string;
}

// =====================
// Document Types (matching backend DocumentInfo)
// =====================
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

export interface JobStatusResponse {
  jobId?: string;
  status?: string;
  message?: string;
  documentId?: string;
  progress?: Record<string, unknown>;
}

// =====================
// UI-specific Types
// =====================
export interface ChatData {
  title: string;
  subtitle: string;
  question: string;
  answer: {
    intro: string;
    points: {
      title: string;
      content: string;
    }[];
    conclusion: string;
  };
}

// Document management types for Admin
export interface Document {
  id: string;
  title: string;
  description: string;
  entrepreneurName: string;
  category: string;
  content: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DocumentFormData {
  title: string;
  description: string;
  entrepreneurName: string;
  category: string;
  content: string;
  tags: string[];
  status: "draft" | "published" | "archived";
}
