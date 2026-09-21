import { WordEntry, UserSettings } from '../types';
import { SRSService } from './srsService';

// Cookie helper utilities
export class CookieUtil {
  static set(name: string, value: string, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  static get(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  static remove(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  }
}

const STORAGE_KEYS = {
  WORD_BANK: 'tc_word_bank',
  SETTINGS: 'tc_settings',
  STREAK: 'tc_streak'
};

const DEFAULT_SETTINGS: UserSettings = {
  sourceLang: 'en',
  targetLang: 'es',
  engine: 'google',
  theme: 'light',
  autoTranslate: true
};

// Initial starter words for a fresh user experience
const STARTER_WORDS: WordEntry[] = [
  {
    id: 'starter-1',
    sourceText: 'hello',
    translatedText: 'hola',
    sourceLang: 'en',
    targetLang: 'es',
    romanization: 'hō-lä',
    dictionary: [{ pos: 'interjection', words: ['hola', 'buenos días'] }],
    notes: 'Standard greeting',
    tags: ['greetings', 'basics'],
    dateAdded: new Date(Date.now() - 3 * 86400000).toISOString(),
    srs: SRSService.createInitialSRSState()
  },
  {
    id: 'starter-2',
    sourceText: 'thank you very much',
    translatedText: 'muchas gracias',
    sourceLang: 'en',
    targetLang: 'es',
    notes: 'Polite expression of gratitude',
    tags: ['polite', 'basics'],
    dateAdded: new Date(Date.now() - 2 * 86400000).toISOString(),
    srs: SRSService.createInitialSRSState()
  },
  {
    id: 'starter-3',
    sourceText: 'where is the train station?',
    translatedText: '¿dónde está la estación de tren?',
    sourceLang: 'en',
    targetLang: 'es',
    notes: 'Useful for navigation and travel',
    tags: ['travel', 'questions'],
    dateAdded: new Date(Date.now() - 1 * 86400000).toISOString(),
    srs: SRSService.createInitialSRSState()
  }
];

export class StorageService {
  // Sync core state to cookies
  private static syncToCookies(words: WordEntry[], settings: UserSettings) {
    try {
      CookieUtil.set('tc_source_lang', settings.sourceLang);
      CookieUtil.set('tc_target_lang', settings.targetLang);
      CookieUtil.set('tc_engine', settings.engine);
      CookieUtil.set('tc_word_count', String(words.length));
      
      if (words.length > 0) {
        const last = words[words.length - 1];
        CookieUtil.set('tc_last_added', `${last.sourceText}:${last.translatedText}`);
        
        // Save a compact summary dictionary into cookie (up to ~3KB) to satisfy cookie dictionary storage
        const compactDict = words.slice(-20).map(w => `${w.sourceText}=>${w.translatedText}`).join('|');
        CookieUtil.set('tc_added_dictionary', compactDict);
      }
    } catch (e) {
      console.warn('Cookie sync warning:', e);
    }
  }

  // Load word bank from localStorage with starter fallback
  static loadWordBank(): WordEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORD_BANK);
      if (!data) {
        // Initialize with starter words
        this.saveWordBank(STARTER_WORDS);
        return STARTER_WORDS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load word bank from localStorage:', e);
      return STARTER_WORDS;
    }
  }

  // Save word bank to localStorage and synchronize to cookies
  static saveWordBank(words: WordEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORD_BANK, JSON.stringify(words));
      const settings = this.loadSettings();
      this.syncToCookies(words, settings);
    } catch (e) {
      console.error('Failed to save word bank:', e);
    }
  }

  // Add word to word bank
  static addWord(word: Omit<WordEntry, 'id' | 'dateAdded' | 'srs'>): WordEntry {
    const words = this.loadWordBank();
    
    // Check if word already exists for this pair
    const existingIndex = words.findIndex(
      w => w.sourceText.trim().toLowerCase() === word.sourceText.trim().toLowerCase() &&
           w.sourceLang === word.sourceLang &&
           w.targetLang === word.targetLang
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated: WordEntry = {
        ...words[existingIndex],
        ...word,
        tags: Array.from(new Set([...words[existingIndex].tags, ...word.tags]))
      };
      words[existingIndex] = updated;
      this.saveWordBank(words);
      return updated;
    }

    const newWord: WordEntry = {
      ...word,
      id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      dateAdded: new Date().toISOString(),
      srs: SRSService.createInitialSRSState()
    };

    words.unshift(newWord);
    this.saveWordBank(words);
    return newWord;
  }

  // Check if a word is already in the word bank
  static isWordSaved(sourceText: string, sourceLang: string, targetLang: string): boolean {
    if (!sourceText.trim()) return false;
    const words = this.loadWordBank();
    return words.some(
      w => w.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
           (w.sourceLang === sourceLang || sourceLang === 'auto') &&
           w.targetLang === targetLang
    );
  }

  // Update existing word
  static updateWord(updatedWord: WordEntry): void {
    const words = this.loadWordBank();
    const index = words.findIndex(w => w.id === updatedWord.id);
    if (index >= 0) {
      words[index] = updatedWord;
      this.saveWordBank(words);
    }
  }

  // Delete word from word bank
  static deleteWord(id: string): void {
    const words = this.loadWordBank();
    const filtered = words.filter(w => w.id !== id);
    this.saveWordBank(filtered);
  }

  // Load user settings (checking cookies first for preferences)
  static loadSettings(): UserSettings {
    try {
      let settings = { ...DEFAULT_SETTINGS };
      
      const localData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (localData) {
        settings = { ...settings, ...JSON.parse(localData) };
      }

      // Honor cookie values if present
      const cookieSource = CookieUtil.get('tc_source_lang');
      const cookieTarget = CookieUtil.get('tc_target_lang');
      const cookieEngine = CookieUtil.get('tc_engine') as any;

      if (cookieSource) settings.sourceLang = cookieSource;
      if (cookieTarget) settings.targetLang = cookieTarget;
      if (cookieEngine) settings.engine = cookieEngine;

      return settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // Save user settings to both localStorage and cookies
  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      CookieUtil.set('tc_source_lang', settings.sourceLang);
      CookieUtil.set('tc_target_lang', settings.targetLang);
      CookieUtil.set('tc_engine', settings.engine);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  // Streak tracker
  static getStreak(): number {
    const streakStr = CookieUtil.get('tc_streak') || localStorage.getItem(STORAGE_KEYS.STREAK);
    return streakStr ? parseInt(streakStr, 10) : 1;
  }

  static incrementStreak(): void {
    const current = this.getStreak();
    const next = current + 1;
    CookieUtil.set('tc_streak', String(next));
    localStorage.setItem(STORAGE_KEYS.STREAK, String(next));
  }

  // Export dictionary as JSON
  static exportJSON(): string {
    const words = this.loadWordBank();
    return JSON.stringify(words, null, 2);
  }

  // Export dictionary as Anki/CSV
  static exportCSV(): string {
    const words = this.loadWordBank();
    const header = 'Source Text,Translated Text,Source Language,Target Language,Tags,Notes,Mastery\n';
    const rows = words.map(w => 
      `"${w.sourceText.replace(/"/g, '""')}","${w.translatedText.replace(/"/g, '""')}","${w.sourceLang}","${w.targetLang}","${(w.tags || []).join(';')}","${(w.notes || '').replace(/"/g, '""')}","${w.srs.masteryStage}"`
    ).join('\n');
    return header + rows;
  }

  // Import words from JSON string
  static importJSON(jsonString: string): number {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Invalid JSON array');
      
      const current = this.loadWordBank();
      let importedCount = 0;

      for (const item of parsed) {
        if (item.sourceText && item.translatedText) {
          const exists = current.some(
            w => w.sourceText.toLowerCase() === item.sourceText.toLowerCase() &&
                 w.targetLang === item.targetLang
          );
          if (!exists) {
            current.unshift({
              ...item,
              id: item.id || 'import_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              dateAdded: item.dateAdded || new Date().toISOString(),
              srs: item.srs || SRSService.createInitialSRSState()
            });
            importedCount++;
          }
        }
      }

      this.saveWordBank(current);
      return importedCount;
    } catch (e: any) {
      throw new Error(`Import failed: ${e.message}`);
    }
  }
}
