
export interface CareInstructions {
  water: string;
  light: string;
  soil: string;
  humidity: string;
  temperature: string;
}

export interface PlantInfo {
  commonName: string;
  scientificName: string;
  description: string;
  careInstructions: CareInstructions;
  petFriendly: boolean;
  funFact: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  ANALYZE = 'ANALYZE',
  CHAT = 'CHAT',
}

// Experimental Chrome AI APIs
declare global {
  interface Window {
    ai: {
      languageModel: {
        capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
        create: (options?: { systemPrompt?: string }) => Promise<AILanguageModel>;
      };
    };
  }
}

export interface AILanguageModel {
  prompt: (input: string) => Promise<string>;
  promptStreaming: (input: string) => ReadableStream;
  destroy: () => void;
}
