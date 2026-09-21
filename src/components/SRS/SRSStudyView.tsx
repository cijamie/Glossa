import React, { useState, useMemo } from 'react';
import { BrainCircuit, Play, Sparkles, Layers, CheckSquare, Keyboard, X } from 'lucide-react';
import { WordEntry, StudyMode, StudySessionStats } from '../../types';
import { Flashcard } from './Flashcard';
import { QuizChoice } from './QuizChoice';
import { QuizTyping } from './QuizTyping';
import { SessionComplete } from './SessionComplete';
import { SRSService } from '../../services/srsService';
import { StorageService } from '../../services/storageService';

interface SRSStudyViewProps {
  words: WordEntry[];
  streak: number;
  onWordsChanged: () => void;
  onNavigateWordBank: () => void;
  onNavigateTranslate: () => void;
}

export const SRSStudyView: React.FC<SRSStudyViewProps> = ({
  words,
  streak,
  onWordsChanged,
  onNavigateWordBank,
  onNavigateTranslate
}) => {
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcards');
  const [onlyDue, setOnlyDue] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionQueue, setSessionQueue] = useState<WordEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<StudySessionStats>({
    totalReviewed: 0,
    correctCount: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0
  });
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Overall dictionary SRS stats
  const stats = useMemo(() => SRSService.getSRSStats(words), [words]);

  // Start study session
  const handleStartSession = () => {
    let queue = onlyDue
      ? words.filter(w => SRSService.isDue(w))
      : [...words];

    // If no due cards and user selected onlyDue, fallback to all words so they can still study
    if (queue.length === 0) {
      queue = [...words];
    }

    // Shuffle queue
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setSessionQueue(shuffled);
    setCurrentIndex(0);
    setSessionStats({
      totalReviewed: 0,
      correctCount: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0
    });
    setIsSessionComplete(false);
    setIsSessionActive(true);
  };

  // Grade current word and advance
  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    const currentWord = sessionQueue[currentIndex];
    if (!currentWord) return;

    // Calculate next SM-2 state
    const newSRSState = SRSService.calculateNextReview(currentWord.srs, grade);
    const updatedWord: WordEntry = {
      ...currentWord,
      srs: newSRSState
    };

    // Save to storage
    StorageService.updateWord(updatedWord);
    onWordsChanged();

    // Update session statistics
    setSessionStats(prev => ({
      totalReviewed: prev.totalReviewed + 1,
      correctCount: prev.correctCount + (grade >= 3 ? 1 : 0),
      againCount: prev.againCount + (grade === 1 ? 1 : 0),
      hardCount: prev.hardCount + (grade === 2 ? 1 : 0),
      goodCount: prev.goodCount + (grade === 3 ? 1 : 0),
      easyCount: prev.easyCount + (grade === 4 ? 1 : 0)
    }));

    // If card was failed (Again), optionally re-queue it at the end of current session
    let nextQueue = [...sessionQueue];
    if (grade === 1) {
      nextQueue.push(updatedWord);
    }

    if (currentIndex + 1 < nextQueue.length) {
      setSessionQueue(nextQueue);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session finished!
      StorageService.incrementStreak();
      setIsSessionComplete(true);
    }
  };

  // Render active study screen
  if (isSessionActive) {
    if (isSessionComplete) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SessionComplete
            stats={sessionStats}
            streak={streak}
            onRestart={handleStartSession}
            onNavigateWordBank={onNavigateWordBank}
            onNavigateTranslate={onNavigateTranslate}
          />
        </div>
      );
    }

    const currentCard = sessionQueue[currentIndex];
    const progressPercent = Math.round(((currentIndex) / sessionQueue.length) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
        
        {/* Top Session Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSessionActive(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Exit session"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">
              Card {currentIndex + 1} of {sessionQueue.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] uppercase font-bold tracking-wider">
              {studyMode === 'flashcards' ? 'Flashcards' : studyMode === 'quiz-choice' ? 'Multiple Choice' : 'Typing Quiz'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-google-blue h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Study Component based on mode */}
        {currentCard && (
          <div className="pt-2">
            {studyMode === 'flashcards' && (
              <Flashcard word={currentCard} onGrade={handleGrade} />
            )}
            {studyMode === 'quiz-choice' && (
              <QuizChoice currentWord={currentCard} allWords={words} onAnswer={handleGrade} />
            )}
            {studyMode === 'quiz-typing' && (
              <QuizTyping currentWord={currentCard} onAnswer={handleGrade} />
            )}
          </div>
        )}

      </div>
    );
  }

  // Dashboard / Hub View
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#202124] rounded-3xl border border-gray-200 dark:border-[#3c4043] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-google-blue text-xs font-semibold">
            <BrainCircuit className="w-4 h-4" />
            <span>SuperMemo 2 Spaced Repetition (SRS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-[#e8eaed] tracking-tight">
            Daily Learning Hub
          </h1>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] max-w-lg">
            Review your saved vocabulary at mathematically optimal intervals to build permanent long-term memory.
          </p>
        </div>

        {/* Start Button */}
        <div>
          <button
            onClick={handleStartSession}
            disabled={words.length === 0}
            className="px-6 py-3.5 rounded-2xl bg-google-blue hover:bg-google-blueHover disabled:opacity-40 text-white font-semibold text-base flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Study Session</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Due Cards */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-red-500">Due Today</div>
          <div className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mt-1">{stats.due}</div>
          <div className="text-[11px] text-gray-400 mt-1">Ready for review</div>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streak</span>
          </div>
          <div className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mt-1">{streak} days</div>
          <div className="text-[11px] text-gray-400 mt-1">Consistency score</div>
        </div>

        {/* Learning */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-500">In Progress</div>
          <div className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mt-1">{stats.learning + stats.review}</div>
          <div className="text-[11px] text-gray-400 mt-1">Active retention queue</div>
        </div>

        {/* Mastered */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-green-500">Mastered</div>
          <div className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mt-1">{stats.mastered}</div>
          <div className="text-[11px] text-gray-400 mt-1">Long-term memory</div>
        </div>
      </div>

      {/* Mastery Breakdown Bar */}
      {words.length > 0 && (
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700 dark:text-gray-300">Mastery Distribution</span>
            <span className="text-gray-400">{words.length} Total Words</span>
          </div>

          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${(stats.newCount / words.length) * 100}%` }} className="bg-purple-500 h-full" title={`New: ${stats.newCount}`} />
            <div style={{ width: `${(stats.learning / words.length) * 100}%` }} className="bg-amber-500 h-full" title={`Learning: ${stats.learning}`} />
            <div style={{ width: `${(stats.review / words.length) * 100}%` }} className="bg-blue-500 h-full" title={`Review: ${stats.review}`} />
            <div style={{ width: `${(stats.mastered / words.length) * 100}%` }} className="bg-green-500 h-full" title={`Mastered: ${stats.mastered}`} />
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>New ({stats.newCount})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Learning ({stats.learning})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Review ({stats.review})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Mastered ({stats.mastered})</span>
            </div>
          </div>
        </div>
      )}

      {/* Session Customizer & Study Modes */}
      <div className="bg-white dark:bg-[#202124] p-6 rounded-3xl border border-gray-200 dark:border-[#3c4043] shadow-sm space-y-5">
        <h2 className="text-base font-bold text-[#202124] dark:text-[#e8eaed]">
          Choose Study Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Flashcards */}
          <button
            onClick={() => setStudyMode('flashcards')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              studyMode === 'flashcards'
                ? 'border-google-blue bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#2d2f31]'
            }`}
          >
            <Layers className="w-6 h-6 text-google-blue mb-2" />
            <div className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Flashcards</div>
            <div className="text-xs text-gray-500 mt-1">3D interactive note cards with SM-2 grading</div>
          </button>

          {/* Multiple Choice Quiz */}
          <button
            onClick={() => setStudyMode('quiz-choice')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              studyMode === 'quiz-choice'
                ? 'border-google-blue bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#2d2f31]'
            }`}
          >
            <CheckSquare className="w-6 h-6 text-google-blue mb-2" />
            <div className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Multiple Choice</div>
            <div className="text-xs text-gray-500 mt-1">4-option rapid quiz with smart distractors</div>
          </button>

          {/* Typing Quiz */}
          <button
            onClick={() => setStudyMode('quiz-typing')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              studyMode === 'quiz-typing'
                ? 'border-google-blue bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#2d2f31]'
            }`}
          >
            <Keyboard className="w-6 h-6 text-google-blue mb-2" />
            <div className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Spelling & Typing</div>
            <div className="text-xs text-gray-500 mt-1">Active recall typing test with hint hints</div>
          </button>
        </div>

        {/* Filter scope toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-sm">
          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Session Scope:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOnlyDue(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                onlyDue
                  ? 'bg-google-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Due Cards Only ({stats.due})
            </button>
            <button
              onClick={() => setOnlyDue(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                !onlyDue
                  ? 'bg-google-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              All Words ({words.length})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
