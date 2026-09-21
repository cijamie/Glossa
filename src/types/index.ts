export interface Language {
  code: string;
  name: string;
  native: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedLang?: string;
  romanization?: string | null;
  sourceRomanization?: string | null;
  dictionary?: Array<{ pos: string; words: string[] }>;
  engine: 'google' | 'mymemory' | 'libre' | 'deepl';
  fallbackFrom?: string;
}

export interface SRSState {
  repetition: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  gradeHistory: number[];
  masteryStage: 'new' | 'learning' | 'review' | 'mastered';
}

export interface WordEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  romanization?: string | null;
  dictionary?: Array<{ pos: string; words: string[] }>;
  notes?: string;
  tags: string[];
  dateAdded: string;
  srs: SRSState;
}

export interface UserSettings {
  sourceLang: string;
  targetLang: string;
  engine: 'google' | 'mymemory' | 'libre' | 'deepl';
  deeplApiKey?: string;
  libreCustomUrl?: string;
  theme: 'light' | 'dark';
  autoTranslate: boolean;
}

export type StudyMode = 'flashcards' | 'quiz-choice' | 'quiz-typing';

export interface StudySessionStats {
  totalReviewed: number;
  correctCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
}
