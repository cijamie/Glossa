import React, { useState } from 'react';
import { Volume2, Copy, Check, Star, Loader2, Sparkles } from 'lucide-react';
import { SpeechService } from '../../services/speechService';
import { TranslationResult } from '../../types';

interface TargetCardProps {
  translation: TranslationResult | null;
  targetLang: string;
  sourceText: string;
  sourceLang: string;
  isLoading: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const TargetCard: React.FC<TargetCardProps> = ({
  translation,
  targetLang,
  isLoading,
  isSaved,
  onToggleSave
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!translation?.translatedText) return;
    navigator.clipboard.writeText(translation.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translation?.translatedText) return;
    SpeechService.speak(translation.translatedText, targetLang);
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#1e2022] rounded-b-2xl md:rounded-br-2xl md:rounded-bl-none border border-[#dadce0] dark:border-[#3c4043] flex flex-col min-h-[320px] shadow-sm relative transition-colors">
      
      {/* Engine & Fallback badge */}
      {translation && (
        <div className="px-5 pt-3 flex items-center justify-between text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <span className="font-medium capitalize inline-flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            <span>Engine: {translation.engine}</span>
            {translation.fallbackFrom && ` (fallback from ${translation.fallbackFrom})`}
          </span>
        </div>
      )}

      {/* Translated Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-google-blue">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium">Translating...</span>
          </div>
        ) : translation?.translatedText ? (
          <div className="space-y-4">
            {/* Primary Translation */}
            <div className="text-[#202124] dark:text-[#e8eaed] text-xl sm:text-2xl font-normal leading-relaxed select-text">
              {translation.translatedText}
            </div>

            {/* Romanization / Phonetics if provided */}
            {translation.romanization && (
              <div className="text-sm text-[#5f6368] dark:text-[#9aa0a6] italic font-medium">
                {translation.romanization}
              </div>
            )}

            {/* Dictionary / Part of Speech Alternatives */}
            {translation.dictionary && translation.dictionary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/80">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                  Definitions & Alternatives
                </div>
                <div className="space-y-2">
                  {translation.dictionary.map((entry, idx) => (
                    <div key={idx} className="text-sm flex flex-wrap items-baseline">
                      <span className="text-xs font-bold text-google-blue dark:text-blue-400 mr-2 capitalize">
                        {entry.pos}:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {entry.words.slice(0, 5).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-sm space-y-1">
            <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-1" />
            <span>Translation appears here automatically</span>
            <span className="text-xs text-gray-400">Type in any language on the left</span>
          </div>
        )}

      </div>

      {/* Bottom Controls Bar */}
      <div className="px-5 py-3.5 border-t border-gray-200/80 dark:border-[#2d2f31] flex items-center justify-between bg-white/50 dark:bg-black/10 rounded-b-2xl">
        
        {/* Left: Audio & Copy */}
        <div className="flex items-center space-x-2">
          {translation?.translatedText && (
            <>
              <button
                onClick={handleSpeak}
                className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-google-blue transition-colors shadow-sm"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleCopy}
                className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-google-blue transition-colors shadow-sm relative"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {/* Right: Big Prominent Add to Word Bank Button */}
        <div>
          {translation?.translatedText && (
            <button
              onClick={onToggleSave}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isSaved
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200'
                  : 'bg-google-blue hover:bg-google-blueHover text-white shadow-md shadow-blue-500/20 active:scale-95'
              }`}
              title={isSaved ? 'Word is saved (click to remove)' : 'Add this word to your Word Bank for SRS flashcard study'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'fill-white text-white'}`} />
              <span>{isSaved ? 'Saved in Word Bank' : '+ Add to Word Bank'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
