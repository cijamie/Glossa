import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { WordEntry } from '../../types';
import { POPULAR_SOURCE_LANGUAGES, POPULAR_TARGET_LANGUAGES } from '../../data/languages';
import { TranslateService } from '../../services/translateService';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: Omit<WordEntry, 'id' | 'dateAdded' | 'srs'>) => void;
  defaultSourceLang?: string;
  defaultTargetLang?: string;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  onAddWord,
  defaultSourceLang = 'en',
  defaultTargetLang = 'es'
}) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState(defaultSourceLang === 'auto' ? 'en' : defaultSourceLang);
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);

  if (!isOpen) return null;

  const handleAutoTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsAutoTranslating(true);
    try {
      const res = await TranslateService.translate(sourceText, sourceLang, targetLang);
      if (res.translatedText) {
        setTranslatedText(res.translatedText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAutoTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim() || !translatedText.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => Boolean(t));

    onAddWord({
      sourceText: sourceText.trim(),
      translatedText: translatedText.trim(),
      sourceLang,
      targetLang,
      notes: notes.trim(),
      tags: tags.length > 0 ? tags : ['manual']
    });

    onClose();
    // Reset form
    setSourceText('');
    setTranslatedText('');
    setNotes('');
    setTagsInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-[#202124] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">
            Add Word to Word Bank
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Language selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source Language</label>
              <select
                value={sourceLang}
                onChange={e => setSourceLang(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {POPULAR_SOURCE_LANGUAGES.filter(l => l.code !== 'auto').map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Target Language</label>
              <select
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {POPULAR_TARGET_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Text */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Original Word or Phrase *</label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder="e.g. apple"
                className="w-full text-sm p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:outline-none pr-24"
              />
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={!sourceText.trim() || isAutoTranslating}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-google-blue dark:text-blue-400 text-xs font-medium hover:bg-blue-100 flex items-center space-x-1"
                title="Translate automatically using current engine"
              >
                {isAutoTranslating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Translated Text */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Translation *</label>
            <input
              type="text"
              required
              value={translatedText}
              onChange={e => setTranslatedText(e.target.value)}
              placeholder="e.g. manzana"
              className="w-full text-sm p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Context (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. noun, feminine, example: Me gusta la manzana."
              className="w-full text-sm p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. food, basics, nouns"
              className="w-full text-sm p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sourceText.trim() || !translatedText.trim()}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-google-blue text-white hover:bg-google-blueHover disabled:opacity-50 transition-colors shadow-sm"
            >
              Add to Word Bank
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
