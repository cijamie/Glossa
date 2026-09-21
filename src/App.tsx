import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TranslatorView } from './components/Translator/TranslatorView';
import { WordBankView } from './components/WordBank/WordBankView';
import { SRSStudyView } from './components/SRS/SRSStudyView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { StorageService, CookieUtil } from './services/storageService';
import { SRSService } from './services/srsService';
import { WordEntry, UserSettings } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'translate' | 'wordbank' | 'srs'>('translate');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.loadSettings());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = CookieUtil.get('tc_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [streak, setStreak] = useState<number>(() => StorageService.getStreak());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load words on initial mount
  useEffect(() => {
    const loadedWords = StorageService.loadWordBank();
    setWords(loadedWords);
  }, []);

  // Sync theme changes with DOM and cookie
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    CookieUtil.set('tc_theme', theme);
  }, [theme]);

  // Refresh words from storage
  const handleWordsChanged = () => {
    const updated = StorageService.loadWordBank();
    setWords(updated);
    setStreak(StorageService.getStreak());
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const dueCount = SRSService.getDueWords(words).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#171717] text-[#202124] dark:text-[#e8eaed] flex flex-col font-sans transition-colors">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wordCount={words.length}
        dueCount={dueCount}
        streak={streak}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'translate' && (
          <TranslatorView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onWordBankUpdated={handleWordsChanged}
          />
        )}

        {activeTab === 'wordbank' && (
          <WordBankView
            words={words}
            onWordsChanged={handleWordsChanged}
            settings={settings}
            onNavigateToStudy={() => setActiveTab('srs')}
          />
        )}

        {activeTab === 'srs' && (
          <SRSStudyView
            words={words}
            streak={streak}
            onWordsChanged={handleWordsChanged}
            onNavigateWordBank={() => setActiveTab('wordbank')}
            onNavigateTranslate={() => setActiveTab('translate')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-[#2d2f31] text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Glossa • Free Multi-Engine Translator + Spaced Repetition (SRS)
          </div>
          <div className="flex items-center space-x-4">
            <span>Client-side SPA (GitHub Pages ready)</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline hover:text-google-blue"
            >
              Engine: {settings.engine}
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={s => {
          setSettings(s);
          StorageService.saveSettings(s);
        }}
        wordCount={words.length}
        onResetSampleData={() => {
          localStorage.removeItem('tc_word_bank');
          const reset = StorageService.loadWordBank();
          setWords(reset);
        }}
      />

    </div>
  );
}

export default App;
