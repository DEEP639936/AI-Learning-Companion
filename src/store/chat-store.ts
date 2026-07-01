import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  isStreaming: boolean;
  setStreaming: (streaming: boolean) => void;
  mode: 'default' | 'eli5' | 'socratic' | 'exam-prep';
  setMode: (mode: 'default' | 'eli5' | 'socratic' | 'exam-prep') => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  isStreaming: false,
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  mode: 'default',
  setMode: (mode) => set({ mode }),
}));
