import { apiClient, ApiResponse } from './apiClient';

// =====================
// Backend API Types (matching Swagger)
// =====================

// ChatSessionDto - response from /api/history/sessions
export interface ChatSessionDto {
  sessionId: string;
  sessionName: string;
  createdAt: string;
  updatedAt: string;
}

// SessionSummaryDto - from GET /api/history/sessions
export interface SessionSummaryDto {
  sessionId: string;
  sessionName: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

// ChatHistoryDto - message in a session
export interface ChatHistoryDto {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  aiModel?: string;
  createdAt: string;
}

// CreateChatSessionDto - POST /api/history/sessions
export interface CreateChatSessionDto {
  sessionId?: string;
  sessionName?: string;
}

// UpdateChatSessionDto - PUT /api/history/sessions/{sessionId}
export interface UpdateChatSessionDto {
  sessionName?: string;
}

// CreateChatHistoryDto - POST /api/history/messages
export interface CreateChatHistoryDto {
  sessionId: string;
  question: string;
  answer: string;
  aiModel?: string;
}

// UpdateChatHistoryDto - PUT /api/history/messages/{id}
export interface UpdateChatHistoryDto {
  question?: string;
  answer?: string;
  aiModel?: string;
}

// =====================
// Legacy types for backwards compatibility
// =====================
export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  pinned: boolean;
  lastMessage?: string;
  messageCount?: number;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  pinned?: boolean;
}

// Helper to convert SessionSummaryDto to Conversation
function sessionToConversation(session: SessionSummaryDto): Conversation {
  const safeCreatedAt = session.createdAt || new Date().toISOString();
  const safeLastMessageAt = session.lastMessageAt || safeCreatedAt;

  return {
    id: session.sessionId,
    title: session.sessionName || 'Cuộc trò chuyện mới',
    timestamp: new Date(safeLastMessageAt),
    pinned: false, // Backend không có field này
    lastMessage: undefined,
    messageCount: session.messageCount || 0,
  };
}

const normalizeSessionSummary = (item: any): SessionSummaryDto | null => {
  if (!item || typeof item !== 'object') return null;

  const sessionId = item.sessionId || item.session_id || item.SessionId;

  if (!sessionId) return null;

  const createdAt = item.createdAt || item.created_at || item.CreatedAt || new Date().toISOString();
  const lastMessageAt =
    item.lastMessageAt || item.last_message_at || item.LastMessageAt || item.updatedAt || item.updated_at || item.UpdatedAt || createdAt;

  return {
    sessionId,
    sessionName: item.sessionName || item.session_name || item.SessionName || 'Cuộc trò chuyện mới',
    createdAt,
    lastMessageAt,
    messageCount: Number(item.messageCount ?? item.message_count ?? item.MessageCount ?? 0),
  };
};

const isSessionLike = (item: unknown): boolean => {
  if (!item || typeof item !== 'object') return false;
  const record = item as Record<string, unknown>;
  const hasSessionId =
    record.sessionId !== undefined ||
    record.session_id !== undefined ||
    record.SessionId !== undefined;
  return hasSessionId;
};

const findSessionArrayDeep = (raw: unknown, depth: number = 0): unknown[] | null => {
  if (depth > 5 || raw === null || raw === undefined) return null;

  if (Array.isArray(raw)) {
    if (raw.length === 0) return raw;
    if (raw.some(isSessionLike)) return raw;

    for (const item of raw) {
      const nested = findSessionArrayDeep(item, depth + 1);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const preferredKeys = [
    'items',
    'Items',
    'sessions',
    'Sessions',
    'results',
    'Results',
    'list',
    'List',
    'value',
    'Value',
    'data',
    'Data',
  ];

  for (const key of preferredKeys) {
    if (!(key in record)) continue;
    const nested = findSessionArrayDeep(record[key], depth + 1);
    if (nested) return nested;
  }

  for (const value of Object.values(record)) {
    const nested = findSessionArrayDeep(value, depth + 1);
    if (nested) return nested;
  }

  return null;
};

const extractSessionSummaryList = (raw: unknown): SessionSummaryDto[] => {
  const sessionsRaw = findSessionArrayDeep(raw);
  if (!sessionsRaw) return [];

  return sessionsRaw
    .map(normalizeSessionSummary)
    .filter((session): session is SessionSummaryDto => session !== null);
};

// =====================
// History Service - matching Backend API
// =====================
export const historyService = {
  // Get all sessions - GET /api/history/sessions
  async getSessions(): Promise<ApiResponse<SessionSummaryDto[]>> {
    const response = await apiClient.get<unknown>('/history/sessions');
    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: extractSessionSummaryList(response.data),
    };
  },

  // Get all conversations (legacy wrapper)
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    const response = await this.getSessions();
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          conversations: response.data.map(sessionToConversation),
        },
      };
    }
    return {
      success: false,
      error: response.error,
    };
  },

  // Create new session - POST /api/history/sessions
  async createSession(sessionName?: string, sessionId?: string): Promise<ApiResponse<ChatSessionDto>> {
    const request: CreateChatSessionDto = {
      // Let backend generate UUID when sessionId is not provided.
      sessionId,
      sessionName: sessionName || 'Cuộc trò chuyện mới',
    };
    return apiClient.post<ChatSessionDto>('/history/sessions', request);
  },

  // Create new conversation (legacy wrapper)
  async createConversation(title?: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    const response = await this.createSession(title);
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          conversation: {
            id: response.data.sessionId,
            title: response.data.sessionName || 'Cuộc trò chuyện mới',
            timestamp: new Date(response.data.createdAt),
            pinned: false,
          },
        },
      };
    }
    return {
      success: false,
      error: response.error,
    };
  },

  // Get session by ID - GET /api/history/sessions/{sessionId}
  async getSession(sessionId: string): Promise<ApiResponse<ChatSessionDto>> {
    return apiClient.get<ChatSessionDto>(`/history/sessions/${sessionId}`);
  },

  // Update session - PUT /api/history/sessions/{sessionId}
  async updateSession(sessionId: string, sessionName: string): Promise<ApiResponse<ChatSessionDto>> {
    const request: UpdateChatSessionDto = { sessionName };
    return apiClient.put<ChatSessionDto>(`/history/sessions/${sessionId}`, request);
  },

  // Update conversation (legacy wrapper)
  async updateConversation(
    conversationId: string,
    updates: UpdateConversationRequest
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    const sessionId = conversationId?.trim();
    if (!sessionId) {
      return { success: false, error: 'Invalid session ID' };
    }

    if (updates.title) {
      const response = await this.updateSession(sessionId, updates.title);
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            conversation: {
              id: response.data.sessionId,
              title: response.data.sessionName || '',
              timestamp: new Date(response.data.updatedAt),
              pinned: updates.pinned || false,
            },
          },
        };
      }
      return { success: false, error: response.error };
    }

    return { success: true, data: { conversation: { id: conversationId, title: '', timestamp: new Date(), pinned: updates.pinned || false } } };
  },

  // Delete session - DELETE /api/history/sessions/{sessionId}
  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/history/sessions/${sessionId}`);
  },

  // Delete conversation (legacy wrapper)
  async deleteConversation(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const sessionId = conversationId?.trim();
    if (!sessionId) {
      return { success: false, error: 'Invalid session ID' };
    }

    const response = await this.deleteSession(sessionId);
    return {
      success: response.success,
      error: response.error,
      data: { success: response.success },
    };
  },

  // Clear all sessions - DELETE /api/history/sessions/clear-all
  async clearAllSessions(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/history/sessions/clear-all');
  },

  // Get messages in session - GET /api/history/sessions/{sessionId}/messages
  async getSessionMessages(sessionId: string): Promise<ApiResponse<ChatHistoryDto[]>> {
    return apiClient.get<ChatHistoryDto[]>(`/history/sessions/${sessionId}/messages`);
  },

  // Create message - POST /api/history/messages
  async createMessage(
    sessionId: string,
    question: string,
    answer: string,
    aiModel?: string,
  ): Promise<ApiResponse<ChatHistoryDto>> {
    const request: CreateChatHistoryDto = {
      sessionId,
      question,
      answer,
      aiModel,
    };
    return apiClient.post<ChatHistoryDto>('/history/messages', request);
  },

  // Update message - PUT /api/history/messages/{id}
  async updateMessage(messageId: string | number, updates: UpdateChatHistoryDto): Promise<ApiResponse<ChatHistoryDto>> {
    return apiClient.put<ChatHistoryDto>(`/history/messages/${messageId}`, updates);
  },

  // Delete message - DELETE /api/history/messages/{id}
  async deleteMessage(messageId: string | number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/history/messages/${messageId}`);
  },

  // Legacy methods
  async togglePin(conversationId: string, pinned: boolean): Promise<ApiResponse<{ conversation: Conversation }>> {
    // Backend doesn't have pin feature, just return success
    return {
      success: true,
      data: {
        conversation: {
          id: conversationId,
          title: '',
          timestamp: new Date(),
          pinned,
        },
      },
    };
  },

  async renameConversation(conversationId: string, title: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { title });
  },
};

// =====================
// Mock History Service (for development)
// =====================
export const mockHistoryService = {
  // Mock data storage
  sessions: [
    {
      sessionId: 'session-1',
      sessionName: 'Tìm hiểu về Hồ Chí Minh',
      createdAt: '2025-01-15T10:30:00Z',
      lastMessageAt: '2025-01-15T10:45:00Z',
      messageCount: 5,
    },
    {
      sessionId: 'session-2',
      sessionName: 'Nguyễn Trãi và Bình Ngô đại cáo',
      createdAt: '2025-01-15T09:15:00Z',
      lastMessageAt: '2025-01-15T09:30:00Z',
      messageCount: 3,
    },
    {
      sessionId: 'session-3',
      sessionName: 'Trần Hưng Đạo đại chiến Bạch Đằng',
      createdAt: '2025-01-14T16:45:00Z',
      lastMessageAt: '2025-01-14T17:00:00Z',
      messageCount: 8,
    },
    {
      sessionId: 'session-4',
      sessionName: 'Lê Lợi khởi nghĩa Lam Sơn',
      createdAt: '2025-01-13T14:20:00Z',
      lastMessageAt: '2025-01-13T14:35:00Z',
      messageCount: 4,
    },
    {
      sessionId: 'session-5',
      sessionName: 'Hai Bà Trưng khởi nghĩa',
      createdAt: '2025-01-12T11:10:00Z',
      lastMessageAt: '2025-01-12T11:25:00Z',
      messageCount: 6,
    },
  ] as SessionSummaryDto[],

  messages: [] as ChatHistoryDto[],

  async getSessions(): Promise<ApiResponse<SessionSummaryDto[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: [...this.sessions],
    };
  },

  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    const response = await this.getSessions();
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          conversations: response.data.map(sessionToConversation),
        },
      };
    }
    return { success: false, error: response.error };
  },

  async createSession(sessionName?: string): Promise<ApiResponse<ChatSessionDto>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newSession: ChatSessionDto = {
      sessionId: `session-${Date.now()}`,
      sessionName: sessionName || 'Cuộc trò chuyện mới',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.unshift({
      ...newSession,
      lastMessageAt: newSession.createdAt,
      messageCount: 0,
    });

    return {
      success: true,
      data: newSession,
    };
  },

  async createConversation(title?: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    const response = await this.createSession(title);
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          conversation: {
            id: response.data.sessionId,
            title: response.data.sessionName,
            timestamp: new Date(response.data.createdAt),
            pinned: false,
          },
        },
      };
    }
    return { success: false, error: response.error };
  },

  async getSession(sessionId: string): Promise<ApiResponse<ChatSessionDto>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const session = this.sessions.find(s => s.sessionId === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }
    return {
      success: true,
      data: {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        createdAt: session.createdAt,
        updatedAt: session.lastMessageAt,
      },
    };
  },

  async updateSession(sessionId: string, sessionName: string): Promise<ApiResponse<ChatSessionDto>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.sessions.findIndex(s => s.sessionId === sessionId);
    if (index === -1) {
      return { success: false, error: 'Session not found' };
    }

    this.sessions[index].sessionName = sessionName;

    return {
      success: true,
      data: {
        sessionId: this.sessions[index].sessionId,
        sessionName: this.sessions[index].sessionName,
        createdAt: this.sessions[index].createdAt,
        updatedAt: new Date().toISOString(),
      },
    };
  },

  async updateConversation(conversationId: string, updates: UpdateConversationRequest): Promise<ApiResponse<{ conversation: Conversation }>> {
    const sessionId = conversationId;
    if (updates.title) {
      const response = await this.updateSession(sessionId, updates.title);
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            conversation: {
              id: response.data.sessionId,
              title: response.data.sessionName,
              timestamp: new Date(response.data.updatedAt),
              pinned: updates.pinned || false,
            },
          },
        };
      }
    }
    return { success: true, data: { conversation: { id: conversationId, title: '', timestamp: new Date(), pinned: false } } };
  },

  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.sessions.findIndex(s => s.sessionId === sessionId);
    if (index === -1) {
      return { success: false, error: 'Session not found' };
    }

    this.sessions.splice(index, 1);
    return { success: true };
  },

  async deleteConversation(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const sessionId = conversationId;
    const response = await this.deleteSession(sessionId);
    return {
      success: response.success,
      error: response.error,
      data: { success: response.success },
    };
  },

  async clearAllSessions(): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.sessions = [];
    return { success: true };
  },

  async getSessionMessages(sessionId: string): Promise<ApiResponse<ChatHistoryDto[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const sessionMessages = this.messages.filter(m => m.sessionId === sessionId);
    return {
      success: true,
      data: sessionMessages,
    };
  },

  async createMessage(sessionId: string, question: string, answer: string): Promise<ApiResponse<ChatHistoryDto>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const newMessage: ChatHistoryDto = {
      id: `msg-${Date.now()}`,
      sessionId,
      question,
      answer,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(newMessage);

    // Update session message count
    const sessionIndex = this.sessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex !== -1) {
      this.sessions[sessionIndex].messageCount++;
      this.sessions[sessionIndex].lastMessageAt = newMessage.createdAt;
    }

    return {
      success: true,
      data: newMessage,
    };
  },

  async updateMessage(messageId: string | number, updates: UpdateChatHistoryDto): Promise<ApiResponse<ChatHistoryDto>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = this.messages.findIndex(m => m.id === String(messageId));
    if (index === -1) {
      return { success: false, error: 'Message not found' };
    }

    this.messages[index] = {
      ...this.messages[index],
      ...updates,
    };

    return {
      success: true,
      data: this.messages[index],
    };
  },

  async deleteMessage(messageId: string | number): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = this.messages.findIndex(m => m.id === String(messageId));
    if (index === -1) {
      return { success: false, error: 'Message not found' };
    }

    this.messages.splice(index, 1);
    return { success: true };
  },

  async togglePin(conversationId: string, pinned: boolean): Promise<ApiResponse<{ conversation: Conversation }>> {
    return {
      success: true,
      data: {
        conversation: {
          id: conversationId,
          title: '',
          timestamp: new Date(),
          pinned,
        },
      },
    };
  },

  async renameConversation(conversationId: string, title: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { title });
  },
};

// Export service to use (switch between real and mock)
// Use historyService for production with backend
// Use mockHistoryService for development/testing
export default historyService;
