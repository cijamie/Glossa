export class SpeechService {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  static speak(text: string, langCode: string): void {
    if (!this.isSupported() || !text || !text.trim()) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text.trim());
      
      // Normalize language code (e.g. 'en' -> 'en-US', 'ja' -> 'ja-JP', 'es' -> 'es-ES')
      const normalizedLang = this.getBCP47LanguageTag(langCode);
      utterance.lang = normalizedLang;

      // Try to find a matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
      if (match) {
        utterance.voice = match;
      }

      utterance.rate = 0.95; // slightly natural cadence for learning
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  private static getBCP47LanguageTag(code: string): string {
    const map: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      pt: 'pt-BR',
      ru: 'ru-RU',
      ja: 'ja-JP',
      ko: 'ko-KR',
      zh: 'zh-CN',
      'zh-TW': 'zh-TW',
      ar: 'ar-SA',
      hi: 'hi-IN',
      nl: 'nl-NL',
      pl: 'pl-PL',
      tr: 'tr-TR',
      vi: 'vi-VN',
      th: 'th-TH'
    };
    return map[code] || code;
  }
}
