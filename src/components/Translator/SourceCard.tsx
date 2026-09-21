import React from 'react';
import { Volume2, X, ArrowRight } from 'lucide-react';
import { SpeechService } from '../../services/speechService';

interface SourceCardProps {
  text: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onTranslate: () => void;
  sourceLang: string;
  detectedLang?: string;
  sourceRomanization?: string | null;
  isLoading: boolean;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  text,
  onChange,
  onClear,
  onTranslate,
  sourceLang,
  detectedLang,
  sourceRomanization,
  isLoading
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  const handleSpeak = () => {
    const langToSpeak = sourceLang === 'auto' ? (detectedLang || 'en') : sourceLang;
    SpeechService.speak(text, langToSpeak);
  };

  return (
    <div className="bg-white dark:bg-[#202124] rounded-b-2xl md:rounded-bl-2xl md:rounded-br-none border border-[#dadce0] dark:border-[#3c4043] md:border-r-0 flex flex-col min-h-[300px] shadow-sm relative transition-colors">
      
      {/* Detected language notification if source is auto */}
      {sourceLang === 'auto' && detectedLang && detectedLang !== 'auto' && text.trim() && (
        <div className="px-4 pt-2 text-xs text-google-blue dark:text-blue-400 font-medium">
          Detected: {detectedLang.toUpperCase()}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 flex-1 relative flex flex-col">
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to translate..."
          maxLength={5000}
          className="w-full flex-1 bg-transparent text-[#202124] dark:text-[#e8eaed] placeholder-gray-400 dark:placeholder-gray-500 text-lg sm:text-xl font-normal resize-none focus:outline-none leading-relaxed"
          rows={6}
        />

        {/* Source Phonetic Reading / Romanization */}
        {sourceRomanization && text.trim() && (
          <div className="pt-2 text-sm text-gray-500 dark:text-gray-400 italic">
            🗣️ {sourceRomanization}
          </div>
        )}

        {/* Clear Button */}
        {text && (
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
            title="Clear text"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2d2f31] flex items-center justify-between">
        
        {/* Left: Pronunciation Audio */}
        <div className="flex items-center space-x-2">
          {text.trim() && (
            <button
              onClick={handleSpeak}
              className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-[#3c4043] hover:text-google-blue transition-colors"
              title="Listen pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right: Counter & Translate trigger */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {text.length} / 5000
          </span>

          <button
            onClick={onTranslate}
            disabled={isLoading || !text.trim()}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !text.trim()
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-google-blue hover:bg-google-blueHover text-white shadow-sm shadow-blue-500/20 active:scale-98'
            }`}
          >
            <span>{isLoading ? 'Translating...' : 'Translate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
