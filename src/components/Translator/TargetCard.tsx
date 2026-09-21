import React, { useState } from 'react';
import { Volume2, Copy, Check, Star, Loader2 } from 'lucide-react';
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
    <div className="bg-[#f8f9fa] dark:bg-[#202124] rounded-b-2xl md:rounded-br-2xl md:rounded-bl-none border border-[#dadce0] dark:border-[#3c4043] flex flex-col min-h-[300px] shadow-sm relative transition-colors">
      
      {/* Engine & Fallback badge */}
      {translation && (
        <div className="px-4 pt-2 flex items-center justify-between text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <span className="font-medium capitalize">
            Engine: {translation.engine}
            {translation.fallbackFrom && ` (fallback from ${translation.fallbackFrom})`}
          </span>
        </div>
      )}

      {/* Translated Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        {isLoading ? (
          <div className="flex items-center justify-center h-48 space-x-2 text-google-blue">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Translating...</span>
          </div>
        ) : translation?.translatedText ? (
          <div className="space-y-3">
            {/* Primary Translation */}
            <div className="text-[#202124] dark:text-[#e8eaed] text-lg sm:text-xl font-normal leading-relaxed select-text">
              {translation.translatedText}
            </div>

            {/* Romanization / Phonetics if provided */}
            {translation.romanization && (
              <div className="text-sm text-[#5f6368] dark:text-[#9aa0a6] italic">
                {translation.romanization}
              </div>
            )}

            {/* Dictionary / Part of Speech Alternatives (Google Translate style) */}
            {translation.dictionary && translation.dictionary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                  Dictionary / Definitions
                </div>
                <div className="space-y-2">
                  {translation.dictionary.map((entry, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-xs font-semibold text-google-blue dark:text-blue-400 mr-2 capitalize">
                        {entry.pos}:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {entry.words.slice(0, 6).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            Translation will appear here
          </div>
        )}

      </div>

      {/* Bottom Controls Bar */}
      <div className="px-4 py-3 border-t border-gray-200/80 dark:border-[#2d2f31] flex items-center justify-between">
        
        {/* Left: Audio & Copy */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {translation?.translatedText && (
            <>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-white dark:hover:bg-[#3c4043] hover:text-google-blue transition-colors shadow-sm"
                title="Listen translation"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-white dark:hover:bg-[#3c4043] hover:text-google-blue transition-colors shadow-sm relative"
                title="Copy translation"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {/* Right: Add to Word Bank Action */}
        <div>
          {translation?.translatedText && (
            <button
              onClick={onToggleSave}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
                isSaved
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#2d2f31] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#202124] dark:text-[#e8eaed] hover:text-google-blue border border-gray-200 dark:border-[#3c4043]'
              }`}
              title={isSaved ? 'In Word Bank (click to toggle)' : 'Add to Word Bank for SRS study'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
              <span>{isSaved ? 'Saved in Word Bank' : 'Add to Word Bank'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
