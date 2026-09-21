import { TranslationResult } from '../types';

export class TranslateService {
  // Translate with Google GTX / dict-chrome-ex (Zero-config, client-side, CORS enabled)
  static async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tl = targetLang;
    const clients = ['gtx', 'dict-chrome-ex'];
    let lastError: Error | null = null;

    for (const client of clients) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${sl}&tl=${tl}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
        
        const data = await res.json();
        let translatedText = '';
        let romanization: string | null = null;

        if (Array.isArray(data[0])) {
          for (const item of data[0]) {
            if (item[0]) translatedText += item[0];
            if (item[3]) romanization = item[3];
          }
        }

        let detectedLang = sourceLang;
        if (data[2]) {
          detectedLang = data[2];
        }

        const dict: Array<{ pos: string; words: string[] }> = [];
        if (Array.isArray(data[1])) {
          for (const entry of data[1]) {
            const pos = entry[0];
            const words = entry[1] || [];
            dict.push({ pos, words });
          }
        }

        return {
          translatedText,
          detectedLang,
          romanization,
          dictionary: dict,
          engine: 'google'
        };
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('Google Translate failed');
  }

  // Translate with MyMemory Translated API (CORS enabled)
  static async translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const sl = sourceLang === 'auto' ? 'en' : sourceLang;
    const tl = targetLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
    const data = await res.json();

    if (data.responseStatus !== 200 && data.responseStatus !== '200') {
      throw new Error(data.responseDetails || 'MyMemory translation failed');
    }

    const matches = (data.matches || [])
      .slice(0, 5)
      .map((m: any) => m.translation)
      .filter((t: string) => Boolean(t));

    return {
      translatedText: data.responseData?.translatedText || '',
      detectedLang: sourceLang === 'auto' ? 'en' : sourceLang,
      dictionary: matches.length > 0 ? [{ pos: 'alternative matches', words: matches }] : [],
      engine: 'mymemory'
    };
  }

  // Translate with LibreTranslate (Public mirror or user custom endpoint)
  static async translateWithLibre(text: string, sourceLang: string, targetLang: string, customUrl?: string): Promise<TranslationResult> {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const endpoint = customUrl || 'https://translate.argosopentech.com/translate';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sl,
        target: targetLang,
        format: 'text'
      })
    });

    if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
    const data = await res.json();

    return {
      translatedText: data.translatedText || '',
      detectedLang: data.detectedLanguage?.language || sourceLang,
      dictionary: [],
      engine: 'libre'
    };
  }

  // Translate with DeepL API (if user supplies key in settings)
  static async translateWithDeepL(text: string, sourceLang: string, targetLang: string, apiKey: string): Promise<TranslationResult> {
    if (!apiKey) throw new Error('DeepL API key required');
    const isFree = apiKey.endsWith(':fx');
    const url = isFree 
      ? 'https://api-free.deepl.com/v2/translate' 
      : 'https://api.deepl.com/v2/translate';

    const params = new URLSearchParams();
    params.append('text', text);
    if (sourceLang !== 'auto') {
      params.append('source_lang', sourceLang.toUpperCase());
    }
    params.append('target_lang', targetLang.toUpperCase());

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`);
    const data = await res.json();
    const translation = data.translations[0];

    return {
      translatedText: translation.text,
      detectedLang: translation.detected_source_language?.toLowerCase() || sourceLang,
      dictionary: [],
      engine: 'deepl'
    };
  }

  // Unified translate method with smart fallback
  static async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    engine: 'google' | 'mymemory' | 'libre' | 'deepl' = 'google',
    apiKey?: string,
    customUrl?: string
  ): Promise<TranslationResult> {
    if (!text || !text.trim()) {
      return {
        translatedText: '',
        engine
      };
    }

    try {
      if (engine === 'deepl' && apiKey) {
        return await this.translateWithDeepL(text, sourceLang, targetLang, apiKey);
      } else if (engine === 'mymemory') {
        return await this.translateWithMyMemory(text, sourceLang, targetLang);
      } else if (engine === 'libre') {
        return await this.translateWithLibre(text, sourceLang, targetLang, customUrl);
      } else {
        return await this.translateWithGoogle(text, sourceLang, targetLang);
      }
    } catch (primaryErr: any) {
      console.warn(`[TranslateService] Primary engine '${engine}' error:`, primaryErr);

      // Fallback chain
      if (engine !== 'google') {
        try {
          const fallback = await this.translateWithGoogle(text, sourceLang, targetLang);
          fallback.fallbackFrom = engine;
          return fallback;
        } catch {
          // Continue to next fallback
        }
      }

      if (engine !== 'mymemory') {
        try {
          const fallback = await this.translateWithMyMemory(text, sourceLang, targetLang);
          fallback.fallbackFrom = engine;
          return fallback;
        } catch {
          // Continue to throw
        }
      }

      throw primaryErr;
    }
  }
}
