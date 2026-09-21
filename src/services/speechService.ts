export class SpeechService {
  private static currentAudio: HTMLAudioElement | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window);
  }

  static speak(text: string, langCode: string): void {
    if (!text || !text.trim()) return;

    const cleanText = text.trim();
    // Normalize language code (e.g. 'auto' -> 'en', 'zh-TW' -> 'zh-TW', 'ja' -> 'ja')
    const lang = (langCode === 'auto' ? 'en' : langCode).toLowerCase();
    const primaryLangCode = lang.startsWith('zh') ? lang : lang.split('-')[0];

    // Stop any existing playing audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    // Stop any ongoing speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    // Attempt 1: High-fidelity Google Native TTS Stream (works for Japanese, Korean, Chinese, etc.)
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${primaryLangCode}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Google TTS audio playback blocked/failed, falling back to Web Speech API:', err);
          this.speakWithWebSpeech(cleanText, primaryLangCode);
        });
      }
    } catch {
      this.speakWithWebSpeech(cleanText, primaryLangCode);
    }
  }

  private static speakWithWebSpeech(text: string, langCode: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const bcp47 = this.getBCP47LanguageTag(langCode);
      utterance.lang = bcp47;
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
      if (match) {
        utterance.voice = match;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Web Speech API fallback error:', e);
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
      'zh-tw': 'zh-TW',
      ar: 'ar-SA',
      hi: 'hi-IN',
      nl: 'nl-NL',
      pl: 'pl-PL',
      tr: 'tr-TR',
      vi: 'vi-VN',
      th: 'th-TH'
    };
    return map[code.toLowerCase()] || code;
  }
}
