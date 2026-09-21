import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { POPULAR_SOURCE_LANGUAGES, POPULAR_TARGET_LANGUAGES, getLanguageName } from '../../data/languages';
import { LanguageModal } from './LanguageModal';

interface LanguageBarProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
}

export const LanguageBar: React.FC<LanguageBarProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap
}) => {
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwapClick = () => {
    if (sourceLang === 'auto') return;
    setIsSwapping(true);
    onSwap();
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Ensure current selected source language is displayed in primary tabs
  const sourceChips = [...POPULAR_SOURCE_LANGUAGES];
  if (!sourceChips.some(l => l.code === sourceLang)) {
    sourceChips[sourceChips.length - 1] = {
      code: sourceLang,
      name: getLanguageName(sourceLang),
      native: getLanguageName(sourceLang)
    };
  }

  // Ensure current selected target language is displayed in primary tabs
  const targetChips = [...POPULAR_TARGET_LANGUAGES];
  if (!targetChips.some(l => l.code === targetLang)) {
    targetChips[targetChips.length - 1] = {
      code: targetLang,
      name: getLanguageName(targetLang),
      native: getLanguageName(targetLang)
    };
  }

  return (
    <div className="bg-white dark:bg-[#2d2f31] border-b border-[#dadce0] dark:border-[#3c4043] px-2 sm:px-4 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 rounded-t-2xl shadow-sm">
      
      {/* Source Language Bar */}
      <div className="flex items-center space-x-1 flex-1 overflow-x-auto no-scrollbar py-1">
        {sourceChips.map(lang => {
          const isActive = sourceLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSourceChange(lang.code)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043]'
              }`}
            >
              {lang.name}
            </button>
          );
        })}
        <button
          onClick={() => setIsSourceModalOpen(true)}
          className="p-1.5 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
          title="More source languages"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Swap Languages Button */}
      <div className="flex items-center justify-center my-1 md:my-0">
        <button
          onClick={handleSwapClick}
          disabled={sourceLang === 'auto'}
          title={sourceLang === 'auto' ? 'Cannot swap auto-detect' : 'Swap languages'}
          className={`p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] transition-all ${
            sourceLang === 'auto'
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-[#3c4043] hover:text-google-blue active:scale-95'
          } ${isSwapping ? 'rotate-180 duration-300' : ''}`}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target Language Bar */}
      <div className="flex items-center space-x-1 flex-1 overflow-x-auto no-scrollbar py-1 justify-start md:justify-end">
        {targetChips.map(lang => {
          const isActive = targetLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onTargetChange(lang.code)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043]'
              }`}
            >
              {lang.name}
            </button>
          );
        })}
        <button
          onClick={() => setIsTargetModalOpen(true)}
          className="p-1.5 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
          title="More target languages"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Source Language Picker Modal */}
      <LanguageModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        selectedLanguage={sourceLang}
        onSelect={onSourceChange}
        isSource={true}
      />

      {/* Target Language Picker Modal */}
      <LanguageModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        selectedLanguage={targetLang}
        onSelect={onTargetChange}
        isSource={false}
      />

    </div>
  );
};
