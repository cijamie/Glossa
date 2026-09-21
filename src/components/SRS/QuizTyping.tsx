import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { WordEntry } from '../../types';
import { SpeechService } from '../../services/speechService';

interface QuizTypingProps {
  currentWord: WordEntry;
  onAnswer: (grade: 1 | 2 | 3 | 4) => void;
}

export const QuizTyping: React.FC<QuizTypingProps> = ({ currentWord, onAnswer }) => {
  const [input, setInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const cleanString = (str: string) => str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const isMatch = cleanString(input) === cleanString(currentWord.translatedText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnswered) return;
    setIsAnswered(true);
  };

  const handleNext = () => {
    // If correct without excessive hints: Grade 3 or 4. If wrong: Grade 1.
    if (isMatch) {
      onAnswer(hintCount > 0 ? 2 : 3);
    } else {
      onAnswer(1);
    }
    setInput('');
    setIsAnswered(false);
    setHintCount(0);
  };

  const handleHint = () => {
    setHintCount(prev => prev + 1);
  };

  // Generate hint text (e.g. "m _ _ _ _ _ _" or first few characters)
  const hintDisplay = () => {
    const target = currentWord.translatedText;
    const revealedLength = Math.min(hintCount * 2, target.length);
    return target.substring(0, revealedLength) + '_'.repeat(Math.max(0, target.length - revealedLength));
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Question Card */}
      <div className="bg-white dark:bg-[#202124] rounded-3xl border border-gray-200 dark:border-[#3c4043] p-6 sm:p-8 shadow-md text-center space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold uppercase tracking-wider bg-gray-100 dark:bg-[#303134] px-2.5 py-1 rounded-full">
            Type Translation ({currentWord.sourceLang.toUpperCase()} → {currentWord.targetLang.toUpperCase()})
          </span>
          <button
            onClick={() => SpeechService.speak(currentWord.sourceText, currentWord.sourceLang)}
            className="p-1.5 rounded-full text-gray-400 hover:text-google-blue hover:bg-gray-100 dark:hover:bg-[#3c4043]"
            title="Pronounce"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-2xl sm:text-4xl font-semibold text-[#202124] dark:text-[#e8eaed] pt-2">
          {currentWord.sourceText}
        </h2>

        {hintCount > 0 && (
          <div className="text-sm font-mono tracking-widest text-google-blue dark:text-blue-400 pt-1">
            Hint: {hintDisplay()}
          </div>
        )}
      </div>

      {/* Typing Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            autoFocus
            disabled={isAnswered}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your answer here in target language..."
            className={`w-full p-4 rounded-2xl border-2 text-lg sm:text-xl font-medium text-[#202124] dark:text-[#e8eaed] bg-white dark:bg-[#202124] focus:outline-none transition-all shadow-sm ${
              isAnswered
                ? isMatch
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                  : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                : 'border-gray-200 dark:border-[#3c4043] focus:border-google-blue'
            }`}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleHint}
            disabled={isAnswered || hintCount >= 3}
            className="text-xs text-gray-500 hover:text-google-blue flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Need a Hint?</span>
          </button>

          {!isAnswered ? (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-2.5 rounded-xl bg-google-blue hover:bg-google-blueHover disabled:opacity-50 text-white font-medium text-sm transition-all shadow-sm"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              autoFocus
              className="px-6 py-2.5 rounded-xl bg-google-blue hover:bg-google-blueHover text-white font-medium text-sm flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>Next Word</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Answer feedback card */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-[#3c4043] shadow-md animate-fade-in flex items-center justify-between">
          <div>
            <div className={`text-sm font-bold flex items-center space-x-1.5 ${isMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isMatch ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span>{isMatch ? 'Exact match! Excellent recall.' : 'Incorrect!'}</span>
            </div>
            {!isMatch && (
              <div className="text-xs text-gray-500 mt-1">
                Correct answer: <strong className="text-gray-800 dark:text-gray-200">{currentWord.translatedText}</strong>
              </div>
            )}
          </div>
          <button
            onClick={() => SpeechService.speak(currentWord.translatedText, currentWord.targetLang)}
            className="p-2 rounded-full text-gray-400 hover:text-google-blue"
            title="Pronounce answer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
