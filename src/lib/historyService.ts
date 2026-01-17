import { apiClient, ApiResponse } from './apiClient';

// Conversation History API Types
export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  pinned: boolean;
  lastMessage?: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  pinned?: boolean;
}

// History Service
export const historyService = {
  // Get all conversations for current user
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    return apiClient.get<{ conversations: Conversation[] }>('/chat/conversations');
  },

  // Create new conversation
  async createConversation(title?: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    return apiClient.post<{ conversation: Conversation }>('/chat/conversations', { title });
  },

  // Update conversation (rename or pin)
  async updateConversation(
    conversationId: string,
    updates: UpdateConversationRequest
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    return apiClient.put<{ conversation: Conversation }>(
      `/chat/conversations/${conversationId}`,
      updates
    );
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/chat/conversations/${conversationId}`);
  },

  // Pin/Unpin conversation
  async togglePin(conversationId: string, pinned: boolean): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { pinned });
  },

  // Rename conversation
  async renameConversation(conversationId: string, title: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { title });
  },
};

// Mock History Service (for development)
export const mockHistoryService = {
  // Mock data storage
  conversations: [
    {
      id: '1',
      title: 'Create html game environment f...',
      timestamp: new Date(2026, 0, 15, 10, 30),
      pinned: false,
      lastMessage: 'How do I create a game environment?',
    },
    {
      id: '2',
      title: 'Lorem Ipsum Project',
      timestamp: new Date(2026, 0, 15, 9, 15),
      pinned: false,
      lastMessage: 'Tell me about Lorem Ipsum',
    },
    {
      id: '3',
      title: 'Lorem Project...',
      timestamp: new Date(2026, 0, 14, 16, 45),
      pinned: false,
      lastMessage: 'I need help with...',
    },
    {
      id: '4',
      title: 'Crypto Lending App',
      timestamp: new Date(2026, 0, 13, 14, 20),
      pinned: false,
      lastMessage: 'How to build a lending platform?',
    },
    {
      id: '5',
      title: 'Operator Grammar Types',
      timestamp: new Date(2026, 0, 12, 11, 10),
      pinned: false,
      lastMessage: 'Explain grammar types',
    },
    {
      id: '6',
      title: 'Min States For Binary DFA',
      timestamp: new Date(2026, 0, 11, 15, 30),
      pinned: false,
      lastMessage: 'DFA minimization question',
    },
    {
      id: '7',
      title: 'Lorem POS system',
      timestamp: new Date(2026, 0, 10, 9, 45),
      pinned: false,
      lastMessage: 'Point of sale system design',
    },
  ] as Conversation[],

  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        conversations: [...this.conversations],
      },
    };
  },

  async createConversation(title?: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newConv: Conversation = {
      id: `${Date.now()}`,
      title: title || 'New Chat',
      timestamp: new Date(),
      pinned: false,
    };

    this.conversations.unshift(newConv);

    return {
      success: true,
      data: {
        conversation: newConv,
      },
    };
  },

  async updateConversation(
    conversationId: string,
    updates: UpdateConversationRequest
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.conversations.findIndex(c => c.id === conversationId);
    if (index === -1) {
      return {
        success: false,
        error: 'Conversation not found',
      };
    }

    this.conversations[index] = {
      ...this.conversations[index],
      ...updates,
    };

    return {
      success: true,
      data: {
        conversation: this.conversations[index],
      },
    };
  },

  async deleteConversation(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.conversations.findIndex(c => c.id === conversationId);
    if (index === -1) {
      return {
        success: false,
        error: 'Conversation not found',
      };
    }

    this.conversations.splice(index, 1);

    return {
      success: true,
      data: { success: true },
    };
  },

  async togglePin(conversationId: string, pinned: boolean): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { pinned });
  },

  async renameConversation(conversationId: string, title: string): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.updateConversation(conversationId, { title });
  },
};

// Export service to use (switch between real and mock)
export default mockHistoryService;
