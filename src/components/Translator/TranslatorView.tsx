import React, { useState, useEffect, useRef } from 'react';
import { LanguageBar } from './LanguageBar';
import { SourceCard } from './SourceCard';
import { TargetCard } from './TargetCard';
import { TranslateService } from '../../services/translateService';
import { StorageService } from '../../services/storageService';
import { TranslationResult, UserSettings, WordEntry } from '../../types';

interface TranslatorViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onWordBankUpdated: () => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  settings,
  onUpdateSettings,
  onWordBankUpdated
}) => {
  const [sourceText, setSourceText] = useState('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const debounceTimer = useRef<any>(null);

  // Check if current text is saved in word bank
  useEffect(() => {
    if (sourceText.trim() && translation?.translatedText) {
      const saved = StorageService.isWordSaved(sourceText, settings.sourceLang, settings.targetLang);
      setIsSaved(saved);
    } else {
      setIsSaved(false);
    }
  }, [sourceText, translation, settings.sourceLang, settings.targetLang]);

  // Handle translation execution
  const executeTranslate = async (textToTranslate = sourceText) => {
    if (!textToTranslate || !textToTranslate.trim()) {
      setTranslation(null);
      return;
    }

    setIsLoading(true);
    try {
      const result = await TranslateService.translate(
        textToTranslate,
        settings.sourceLang,
        settings.targetLang,
        settings.engine,
        settings.deeplApiKey,
        settings.libreCustomUrl
      );
      setTranslation(result);
    } catch (err: any) {
      console.error('Translation error:', err);
      setTranslation({
        translatedText: 'Translation error: Could not reach translation service.',
        engine: settings.engine
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced auto-translate on source text change
  const handleSourceChange = (newText: string) => {
    setSourceText(newText);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!newText.trim()) {
      setTranslation(null);
      return;
    }

    if (settings.autoTranslate) {
      debounceTimer.current = setTimeout(() => {
        executeTranslate(newText);
      }, 500);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslation(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  // Swap languages & swap texts
  const handleSwap = () => {
    if (settings.sourceLang === 'auto') return;
    const oldSource = settings.sourceLang;
    const oldTarget = settings.targetLang;
    const oldTargetText = translation?.translatedText || '';

    onUpdateSettings({
      sourceLang: oldTarget,
      targetLang: oldSource
    });

    if (oldTargetText) {
      setSourceText(oldTargetText);
      executeTranslate(oldTargetText);
    } else {
      setSourceText('');
      setTranslation(null);
    }
  };

  // Add / Remove from Word Bank
  const handleToggleSave = () => {
    if (!sourceText.trim() || !translation?.translatedText) return;

    if (isSaved) {
      // Find and remove
      const words = StorageService.loadWordBank();
      const match = words.find(
        w => w.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
             w.targetLang === settings.targetLang
      );
      if (match) {
        StorageService.deleteWord(match.id);
        setIsSaved(false);
        onWordBankUpdated();
      }
    } else {
      // Add new word entry
      const newEntry: Omit<WordEntry, 'id' | 'dateAdded' | 'srs'> = {
        sourceText: sourceText.trim(),
        translatedText: translation.translatedText.trim(),
        sourceLang: settings.sourceLang === 'auto' ? (translation.detectedLang || 'auto') : settings.sourceLang,
        targetLang: settings.targetLang,
        romanization: translation.romanization,
        dictionary: translation.dictionary,
        tags: ['general'],
        notes: ''
      };

      StorageService.addWord(newEntry);
      setIsSaved(true);
      onWordBankUpdated();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Google Translate Container */}
      <div className="rounded-2xl shadow-md border border-[#dadce0] dark:border-[#3c4043] overflow-hidden">
        
        {/* Language Selection Header Bar */}
        <LanguageBar
          sourceLang={settings.sourceLang}
          targetLang={settings.targetLang}
          onSourceChange={code => {
            onUpdateSettings({ sourceLang: code });
            if (sourceText.trim()) executeTranslate();
          }}
          onTargetChange={code => {
            onUpdateSettings({ targetLang: code });
            if (sourceText.trim()) executeTranslate();
          }}
          onSwap={handleSwap}
        />

        {/* Dual Input/Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <SourceCard
            text={sourceText}
            onChange={handleSourceChange}
            onClear={handleClear}
            onTranslate={() => executeTranslate()}
            sourceLang={settings.sourceLang}
            detectedLang={translation?.detectedLang}
            isLoading={isLoading}
          />

          <TargetCard
            translation={translation}
            targetLang={settings.targetLang}
            sourceText={sourceText}
            sourceLang={settings.sourceLang}
            isLoading={isLoading}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
          />
        </div>

      </div>

      {/* Quick Tips / Keyboard shortcuts */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-[#5f6368] dark:text-[#9aa0a6] px-2">
        <div>
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[11px]">Enter</kbd> to translate instantly.
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span>Current Engine: <strong className="capitalize text-google-blue dark:text-blue-400">{settings.engine}</strong></span>
          <span>•</span>
          <span>Dictionary items auto-sync with Cookies</span>
        </div>
      </div>
    </div>
  );
};
