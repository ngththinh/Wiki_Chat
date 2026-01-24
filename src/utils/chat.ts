import { STORAGE_KEYS } from "@/constants";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

// Save messages to localStorage
export const saveMessagesToStorage = (messages: Message[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save messages:", error);
  }
};

// Load messages from localStorage
export const loadMessagesFromStorage = (): Message[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GUEST_MESSAGES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
  return [];
};

// Clear messages from localStorage
export const clearMessagesFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GUEST_MESSAGES);
  } catch (error) {
    console.error("Failed to clear messages:", error);
  }
};

// Create a new message
export const createMessage = (
  role: "user" | "assistant",
  content: string,
  model?: string,
): Message => {
  return {
    id: Date.now().toString() + Math.random(),
    role,
    content,
    timestamp: new Date(),
    model,
  };
};

// Get last user message
export const getLastUserMessage = (messages: Message[]): Message | undefined => {
  return messages.filter((m) => m.role === "user").pop();
};
