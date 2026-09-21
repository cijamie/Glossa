import React, { useState } from 'react';
import { Volume2, Trash2, Edit3, Check, Tag } from 'lucide-react';
import { WordEntry } from '../../types';
import { SpeechService } from '../../services/speechService';
import { SRSService } from '../../services/srsService';

interface WordItemCardProps {
  word: WordEntry;
  onUpdate: (updated: WordEntry) => void;
  onDelete: (id: string) => void;
}

export const WordItemCard: React.FC<WordItemCardProps> = ({
  word,
  onUpdate,
  onDelete
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(word.notes || '');
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const isDue = SRSService.isDue(word);

  const handleSaveNotes = () => {
    onUpdate({ ...word, notes: noteText });
    setIsEditingNotes(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const newTags = Array.from(new Set([...(word.tags || []), tagInput.trim().toLowerCase()]));
    onUpdate({ ...word, tags: newTags });
    setTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = (word.tags || []).filter(t => t !== tagToRemove);
    onUpdate({ ...word, tags: updated });
  };

  // Get mastery stage badge color
  const getStageBadge = () => {
    if (isDue) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
          Due for Review
        </span>
      );
    }
    switch (word.srs.masteryStage) {
      case 'mastered':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/60">
            Mastered ({word.srs.interval}d)
          </span>
        );
      case 'review':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
            Review in {word.srs.interval}d
          </span>
        );
      case 'learning':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
            Learning ({word.srs.interval}d)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60">
            New
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#202124] rounded-xl border border-gray-200 dark:border-[#3c4043] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar: Language Pair & SRS Stage */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#303134] px-2 py-0.5 rounded">
            {word.sourceLang} → {word.targetLang}
          </span>
          {getStageBadge()}
        </div>

        {/* Word Pair */}
        <div className="space-y-1.5 my-2">
          {/* Source Text */}
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-medium text-[#202124] dark:text-[#e8eaed]">
              {word.sourceText}
            </span>
            <button
              onClick={() => SpeechService.speak(word.sourceText, word.sourceLang)}
              className="p-1.5 rounded-full text-gray-400 hover:text-google-blue hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
              title="Pronounce source"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Translated Text */}
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-google-blue dark:text-blue-400">
              {word.translatedText}
            </span>
            <button
              onClick={() => SpeechService.speak(word.translatedText, word.targetLang)}
              className="p-1.5 rounded-full text-gray-400 hover:text-google-blue hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors"
              title="Pronounce translation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Romanization / Pronunciation badge */}
          {word.romanization && (
            <div className="pt-0.5">
              <span className="text-xs font-semibold text-google-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-flex items-center space-x-1">
                <span>🗣️</span>
                <span>{word.romanization}</span>
              </span>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-3 text-xs">
          {isEditingNotes ? (
            <div className="space-y-1.5">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add contextual notes, example sentences, or mnemonic..."
                className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-google-blue"
                rows={2}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-2 py-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 rounded bg-google-blue text-white text-xs font-medium flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingNotes(true)}
              className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 italic flex items-center justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/40"
              title="Click to edit notes"
            >
              <span className="line-clamp-2">
                {word.notes || 'Click to add notes / example sentence...'}
              </span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          {(word.tags || []).map(t => (
            <span
              key={t}
              className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <span>#{t}</span>
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-gray-400 hover:text-red-500 ml-0.5"
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <form onSubmit={handleAddTag} className="inline-flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onBlur={() => setIsAddingTag(false)}
                className="text-[11px] px-1.5 py-0.5 w-16 rounded border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="text-[11px] text-gray-400 hover:text-google-blue flex items-center space-x-0.5 p-0.5"
              title="Add tag"
            >
              <Tag className="w-3 h-3" />
              <span>+tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer: Date & Delete button */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Added {new Date(word.dateAdded).toLocaleDateString()}</span>
        <button
          onClick={() => {
            if (confirm(`Remove "${word.sourceText}" from your Word Bank?`)) {
              onDelete(word.id);
            }
          }}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Delete from word bank"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
