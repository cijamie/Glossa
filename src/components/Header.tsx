import React from 'react';
import { Languages, BookOpen, BrainCircuit, Settings, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'translate' | 'wordbank' | 'srs';
  setActiveTab: (tab: 'translate' | 'wordbank' | 'srs') => void;
  wordCount: number;
  dueCount: number;
  streak: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wordCount,
  dueCount,
  streak,
  theme,
  setTheme,
  onOpenSettings
}) => {
  return (
    <header className="bg-white dark:bg-[#2d2f31] border-b border-[#dadce0] dark:border-[#3c4043] sticky top-0 z-30 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('translate')}>
          <div className="w-10 h-10 rounded-xl bg-google-blue flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Languages className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xl tracking-tight text-[#202124] dark:text-[#e8eaed]">
                <span className="text-google-blue">Glos</span>sa
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-google-blue">
                SRS
              </span>
            </div>
            <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] hidden sm:inline">
              Translate • Collect • Retain
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('translate')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'translate'
                ? 'bg-google-blueLight dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043]'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Translate</span>
          </button>

          <button
            onClick={() => setActiveTab('wordbank')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
              activeTab === 'wordbank'
                ? 'bg-google-blueLight dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Word Bank</span>
            {wordCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                {wordCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('srs')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
              activeTab === 'srs'
                ? 'bg-google-blueLight dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043]'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">Learn & Quiz</span>
            <span className="sm:hidden">Learn</span>
            {dueCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                {dueCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-semibold" title="Daily study streak">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{streak} day streak</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
            title="Settings & Translation Engines"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
