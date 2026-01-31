import { apiClient, ApiResponse } from './apiClient';

// Chat API Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
}

export interface RegenerateRequest {
  conversationId: string;
  messageId: string;
}

// Chat Service
export const chatService = {
  // Send message to AI
  async sendMessage(message: string, conversationId?: string): Promise<ApiResponse<ChatResponse>> {
    return apiClient.post<ChatResponse>('/chat/message', {
      message,
      conversationId,
    });
  },

  // Regenerate AI response
  async regenerateResponse(conversationId: string, messageId: string): Promise<ApiResponse<ChatResponse>> {
    return apiClient.post<ChatResponse>('/chat/regenerate', {
      conversationId,
      messageId,
    });
  },

  // Get conversation messages
  async getConversationMessages(conversationId: string): Promise<ApiResponse<{ messages: Message[] }>> {
    return apiClient.get<{ messages: Message[] }>(`/chat/conversations/${conversationId}/messages`);
  },
};

// Mock Chat Service (for development)
export const mockChatService = {
  async sendMessage(message: string, conversationId?: string): Promise<ApiResponse<ChatResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `This is a mock response to: "${message}". In production, this will be replaced with actual AI responses from the backend.`,
      timestamp: new Date(),
    };

    return {
      success: true,
      data: {
        message: aiMessage,
        conversationId: conversationId || `conv-${Date.now()}`,
      },
    };
  },

  async regenerateResponse(conversationId: string, messageId: string): Promise<ApiResponse<ChatResponse>> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'This is a regenerated mock response. The actual implementation will call the backend API.',
      timestamp: new Date(),
    };

    return {
      success: true,
      data: {
        message: aiMessage,
        conversationId,
      },
    };
  },

  async getConversationMessages(conversationId: string): Promise<ApiResponse<{ messages: Message[] }>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        messages: [],
      },
    };
  },
};

// Export service to use (switch between real and mock)
export default mockChatService;
