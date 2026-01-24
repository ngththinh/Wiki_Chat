// Common types used across the application

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "guest" | "user" | "admin";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export type ChatModel = "RAG" | "GraphRAG";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  pinned: boolean;
}

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

// Document management types
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
