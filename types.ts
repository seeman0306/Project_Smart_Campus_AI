/// <reference types="vite/client" />

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  university?: string;
  course?: string;
  subscription: 'Free' | 'Pro' | 'Team';
  preferences?: {
    notifications: boolean;
    learningGoals: boolean;
    autoSummarize: boolean;
    darkMode: boolean;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  timestamp: number;
  read: boolean;
}

export interface Scan {
  id: string;
  userId: string;
  imageUrl: string;
  ocrText: string;
  timestamp: number;
  subject: string;
}

export interface Summary {
  id: string;
  scanId?: string;
  originalText: string;
  summaryText: string;
  keyPoints: string[];
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Fix: Added missing StudyEvent interface definition to resolve the module export error in pages/Events.tsx
export interface StudyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  organizerId: string;
  participants: string[];
  location: string;
  type: 'Study' | 'Workshop';
}
