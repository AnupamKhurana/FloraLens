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
