import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, BookOpen, Languages } from 'lucide-react';
import { StudySessionStats } from '../../types';

interface SessionCompleteProps {
  stats: StudySessionStats;
  streak: number;
  onRestart: () => void;
  onNavigateWordBank: () => void;
  onNavigateTranslate: () => void;
}

export const SessionComplete: React.FC<SessionCompleteProps> = ({
  stats,
  streak,
  onRestart,
  onNavigateWordBank,
  onNavigateTranslate
}) => {
  useEffect(() => {
    // Launch celebratory confetti fireworks
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const accuracy = stats.totalReviewed > 0
    ? Math.round(((stats.goodCount + stats.easyCount) / stats.totalReviewed) * 100)
    : 100;

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#202124] rounded-3xl border border-gray-200 dark:border-[#3c4043] p-6 sm:p-8 shadow-xl text-center space-y-6 animate-fade-in">
      
      {/* Trophy Badge */}
      <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-500 shadow-md">
        <Trophy className="w-10 h-10 animate-bounce" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-[#e8eaed]">
          Session Complete!
        </h2>
        <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
          You've completed all scheduled cards for this session.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#2d2f31]">
        <div>
          <div className="text-2xl font-bold text-google-blue dark:text-blue-400">
            {stats.totalReviewed}
          </div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
            Reviewed
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {accuracy}%
          </div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
            Retention
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold text-amber-500">
            {streak}d
          </div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
            Streak
          </div>
        </div>
      </div>

      {/* Grade breakdown pills */}
      <div className="flex justify-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600">
          Again: {stats.againCount}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600">
          Hard: {stats.hardCount}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-google-blue">
          Good: {stats.goodCount}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600">
          Easy: {stats.easyCount}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onRestart}
          className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Study More</span>
        </button>

        <button
          onClick={onNavigateWordBank}
          className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center justify-center space-x-1.5 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Word Bank</span>
        </button>

        <button
          onClick={onNavigateTranslate}
          className="flex-1 py-2.5 px-4 rounded-xl bg-google-blue hover:bg-google-blueHover text-white text-sm font-medium flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
        >
          <Languages className="w-4 h-4" />
          <span>Translate</span>
        </button>
      </div>

    </div>
  );
};
