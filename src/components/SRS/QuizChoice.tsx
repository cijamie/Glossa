import React, { useState, useMemo } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { WordEntry } from '../../types';
import { SpeechService } from '../../services/speechService';

interface QuizChoiceProps {
  currentWord: WordEntry;
  allWords: WordEntry[];
  onAnswer: (grade: 1 | 2 | 3 | 4) => void;
}

export const QuizChoice: React.FC<QuizChoiceProps> = ({
  currentWord,
  allWords,
  onAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate 4 randomized options (1 correct + 3 distractors)
  const options = useMemo(() => {
    const correct = currentWord.translatedText;
    const pool = allWords
      .filter(w => w.id !== currentWord.id && w.translatedText !== correct)
      .map(w => w.translatedText);

    // Shuffle pool and take 3
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const distractors = shuffledPool.slice(0, 3);

    // If not enough words in bank, provide generic fallback options
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 1}`);
    }

    // Combine and shuffle
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentWord, allWords]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentWord.translatedText;
    // If correct, award Grade 3 (Good); if wrong, Grade 1 (Again)
    onAnswer(isCorrect ? 3 : 1);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const isCorrect = selectedOption === currentWord.translatedText;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Question Card */}
      <div className="bg-white dark:bg-[#202124] rounded-3xl border border-gray-200 dark:border-[#3c4043] p-6 sm:p-8 shadow-md text-center space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold uppercase tracking-wider bg-gray-100 dark:bg-[#303134] px-2.5 py-1 rounded-full">
            Translate this ({currentWord.sourceLang.toUpperCase()} → {currentWord.targetLang.toUpperCase()})
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

        {currentWord.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic max-w-md mx-auto">
            Hint: {currentWord.notes}
          </p>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          let btnStyle = 'bg-white dark:bg-[#202124] border-gray-200 dark:border-[#3c4043] text-gray-800 dark:text-gray-200 hover:border-google-blue hover:bg-blue-50/40 dark:hover:bg-blue-950/20';

          if (isAnswered) {
            if (option === currentWord.translatedText) {
              btnStyle = 'bg-green-100 dark:bg-green-950/60 border-green-500 text-green-800 dark:text-green-300 font-semibold';
            } else if (option === selectedOption) {
              btnStyle = 'bg-red-100 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-300 font-semibold';
            } else {
              btnStyle = 'opacity-40 border-gray-200 dark:border-[#3c4043]';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={`p-4 rounded-2xl border-2 text-left text-base sm:text-lg transition-all flex items-center justify-between shadow-sm active:scale-98 ${btnStyle}`}
            >
              <span className="truncate">{option}</span>
              {isAnswered && option === currentWord.translatedText && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
              )}
              {isAnswered && option === selectedOption && option !== currentWord.translatedText && (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Next button */}
      {isAnswered && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-[#3c4043] shadow-md animate-fade-in">
          <div>
            <div className={`text-sm font-bold flex items-center space-x-1.5 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span>{isCorrect ? 'Correct! Well done.' : 'Incorrect!'}</span>
            </div>
            {!isCorrect && (
              <div className="text-xs text-gray-500 mt-1">
                Correct answer: <strong className="text-gray-800 dark:text-gray-200">{currentWord.translatedText}</strong>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            autoFocus
            className="px-5 py-2.5 rounded-xl bg-google-blue hover:bg-google-blueHover text-white font-medium text-sm flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>Next Word</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
