import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { WordEntry } from '../../types';
import { SpeechService } from '../../services/speechService';
import { SRSService } from '../../services/srsService';

interface FlashcardProps {
  word: WordEntry;
  onGrade: (grade: 1 | 2 | 3 | 4) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, onGrade }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  // Keyboard navigation: Space to flip, 1-4 for grading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') onGrade(1);
        else if (e.key === '2') onGrade(2);
        else if (e.key === '3') onGrade(3);
        else if (e.key === '4') onGrade(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, onGrade]);

  const handleSpeak = (e: React.MouseEvent, text: string, lang: string) => {
    e.stopPropagation();
    SpeechService.speak(text, lang);
  };

  const againInterval = SRSService.getProjectedInterval(word.srs, 1);
  const hardInterval = SRSService.getProjectedInterval(word.srs, 2);
  const goodInterval = SRSService.getProjectedInterval(word.srs, 3);
  const easyInterval = SRSService.getProjectedInterval(word.srs, 4);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 3D Flip Card Container */}
      <div
        className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (Source Language) */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#202124] rounded-3xl border-2 border-gray-200 dark:border-[#3c4043] shadow-lg p-6 sm:p-8 flex flex-col justify-between backface-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#303134] px-2.5 py-1 rounded-full">
                Prompt ({word.sourceLang.toUpperCase()})
              </span>
              <button
                onClick={e => handleSpeak(e, word.sourceText, word.sourceLang)}
                className="p-2 rounded-full text-gray-400 hover:text-google-blue hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
                title="Pronounce"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center my-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">
                {word.sourceText}
              </h2>
              {word.tags && word.tags.length > 0 && (
                <div className="flex justify-center gap-1.5 pt-2">
                  {word.tags.map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-google-blue">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Click card or press Space to reveal translation</span>
            </div>
          </div>

          {/* Card Back (Target Language & Notes) */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#202124] rounded-3xl border-2 border-blue-300 dark:border-blue-900 shadow-xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-google-blue bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                Translation ({word.targetLang.toUpperCase()})
              </span>
              <button
                onClick={e => handleSpeak(e, word.translatedText, word.targetLang)}
                className="p-2 rounded-full text-gray-400 hover:text-google-blue hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
                title="Pronounce"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center my-auto space-y-3">
              <div className="text-sm font-medium text-gray-400 dark:text-gray-500">
                {word.sourceText}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-google-blue dark:text-blue-400 tracking-tight">
                {word.translatedText}
              </h2>
              {word.romanization && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {word.romanization}
                </p>
              )}
              {word.notes && (
                <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#2d2f31] p-2.5 rounded-xl max-w-sm mx-auto">
                  {word.notes}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
              Select your recall level below to schedule next review
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Rating Controls */}
      <div className={`w-full mt-6 transition-all duration-300 ${isFlipped ? 'opacity-100 scale-100' : 'opacity-30 pointer-events-none'}`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Again */}
          <button
            onClick={() => onGrade(1)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xs sm:text-sm font-bold">Again</span>
            <span className="text-[11px] opacity-75 mt-0.5">{againInterval}</span>
            <span className="text-[10px] opacity-50 hidden sm:inline">[1]</span>
          </button>

          {/* Hard */}
          <button
            onClick={() => onGrade(2)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xs sm:text-sm font-bold">Hard</span>
            <span className="text-[11px] opacity-75 mt-0.5">{hardInterval}</span>
            <span className="text-[10px] opacity-50 hidden sm:inline">[2]</span>
          </button>

          {/* Good */}
          <button
            onClick={() => onGrade(3)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 text-google-blue dark:text-blue-300 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xs sm:text-sm font-bold">Good</span>
            <span className="text-[11px] opacity-75 mt-0.5">{goodInterval}</span>
            <span className="text-[10px] opacity-50 hidden sm:inline">[3]</span>
          </button>

          {/* Easy */}
          <button
            onClick={() => onGrade(4)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/60 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xs sm:text-sm font-bold">Easy</span>
            <span className="text-[11px] opacity-75 mt-0.5">{easyInterval}</span>
            <span className="text-[10px] opacity-50 hidden sm:inline">[4]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
