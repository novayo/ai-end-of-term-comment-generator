export interface TraitCategory {
  name: string;
  traits: string[];
}

export interface StyleOption {
  name: string;
  description: string;
  example: string;
}

export interface Student {
  id: string; // usually raw string like "1.Name"
  name: string;
  number: string;
}

export interface GenerationConfig {
  studentName: string;
  traits: string[];
  styles: string[];
  wordLimit: number;
  apiKey: string;
}
