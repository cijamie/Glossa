import React from 'react';
import { Languages, BookOpen, BrainCircuit, Settings, Sun, Moon, Flame } from 'lucide-react';

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
    <header className="bg-white dark:bg-[#202124] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none group" 
          onClick={() => setActiveTab('translate')}
        >
          <div className="w-10 h-10 rounded-xl bg-google-blue flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Languages className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white leading-tight">
              <span className="text-google-blue">Glos</span>sa
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Translate & Memorize
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Clean, pill style with clear visual cues */}
        <nav className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl">
          {/* Tab 1: Translate */}
          <button
            onClick={() => setActiveTab('translate')}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'translate'
                ? 'bg-white dark:bg-gray-700 text-google-blue dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Translate</span>
          </button>

          {/* Tab 2: Word Bank */}
          <button
            onClick={() => setActiveTab('wordbank')}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'wordbank'
                ? 'bg-white dark:bg-gray-700 text-google-blue dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Word Bank</span>
            {wordCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-google-blue dark:text-blue-300">
                {wordCount}
              </span>
            )}
          </button>

          {/* Tab 3: Study Flashcards */}
          <button
            onClick={() => setActiveTab('srs')}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'srs'
                ? 'bg-white dark:bg-gray-700 text-google-blue dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">Study Cards</span>
            <span className="sm:hidden">Study</span>
            {dueCount > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                {dueCount} due
              </span>
            ) : null}
          </button>
        </nav>

        {/* Right Tools: Streak & Settings */}
        <div className="flex items-center space-x-2">
          {/* Streak indicator */}
          {streak > 0 && (
            <div 
              onClick={() => setActiveTab('srs')}
              className="cursor-pointer hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold"
              title={`${streak} day study streak! Click to study.`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak}d streak</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
