import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, BookOpen, Volume2, CheckCircle2 } from 'lucide-react';
import { LanguageBar } from './LanguageBar';
import { SourceCard } from './SourceCard';
import { TargetCard } from './TargetCard';
import { TranslateService } from '../../services/translateService';
import { StorageService } from '../../services/storageService';
import { SpeechService } from '../../services/speechService';
import { SRSService } from '../../services/srsService';
import { TranslationResult, UserSettings, WordEntry } from '../../types';

interface TranslatorViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onWordBankUpdated: () => void;
  onNavigateToStudy: () => void;
  onNavigateToWordBank: () => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  settings,
  onUpdateSettings,
  onWordBankUpdated,
  onNavigateToStudy,
  onNavigateToWordBank
}) => {
  const [sourceText, setSourceText] = useState('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const debounceTimer = useRef<any>(null);

  const [recentWords, setRecentWords] = useState<WordEntry[]>([]);

  const refreshRecent = () => {
    const all = StorageService.loadWordBank();
    setRecentWords(all.slice(0, 4));
  };

  useEffect(() => {
    refreshRecent();
  }, []);

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
      }, 400);
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
      // Remove
      const words = StorageService.loadWordBank();
      const match = words.find(
        w => w.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
             w.targetLang === settings.targetLang
      );
      if (match) {
        StorageService.deleteWord(match.id);
        setIsSaved(false);
        onWordBankUpdated();
        refreshRecent();
        showToast('Removed from Word Bank');
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
      refreshRecent();
      showToast(`Added "${newEntry.sourceText}" to your Word Bank!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const dueCount = StorageService.loadWordBank().filter(w => SRSService.isDue(w)).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span>{toastMessage}</span>
          <button
            onClick={onNavigateToStudy}
            className="ml-2 text-xs font-bold text-google-blue bg-white px-2.5 py-1 rounded-lg hover:bg-gray-100"
          >
            Study Now
          </button>
        </div>
      )}

      {/* Main Google Translate Box */}
      <div className="rounded-3xl shadow-md border border-[#dadce0] dark:border-[#3c4043] overflow-hidden bg-white dark:bg-[#202124]">
        
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

      {/* Quick Access & Recent Word Bank Strip */}
      <div className="bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-google-blue" />
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Recent Saved Words
            </span>
            <span className="text-xs text-gray-400">
              (Auto-saved to your personal dictionary)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToWordBank}
              className="text-xs font-semibold text-google-blue hover:underline"
            >
              View All Words →
            </button>
            {dueCount > 0 && (
              <button
                onClick={onNavigateToStudy}
                className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
              >
                <span>Practice {dueCount} Due</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {recentWords.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {recentWords.map(w => (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between hover:border-google-blue transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase">
                    <span>{w.sourceLang} → {w.targetLang}</span>
                    <button
                      onClick={() => SpeechService.speak(w.sourceText, w.sourceLang)}
                      className="text-gray-400 hover:text-google-blue"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate mt-1">
                    {w.sourceText}
                  </div>
                  <div className="font-semibold text-sm text-google-blue dark:text-blue-400 truncate">
                    {w.translatedText}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/40 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="capitalize">{w.srs.masteryStage}</span>
                  <span className="text-google-blue font-medium">SRS</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-gray-400">
            No words saved yet. Click the <strong className="text-google-blue">+ Add to Word Bank</strong> button on any translation to start building your flashcards!
          </div>
        )}
      </div>

      {/* Helpful shortcuts info */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Translate words, save to Word Bank, and let the SRS schedule your daily reviews.</span>
        </div>
        <div className="hidden sm:inline">
          Active Engine: <strong className="capitalize text-google-blue">{settings.engine}</strong>
        </div>
      </div>

    </div>
  );
};
