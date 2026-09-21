import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Download, Upload, Filter, BookOpen } from 'lucide-react';
import { WordEntry, UserSettings } from '../../types';
import { WordItemCard } from './WordItemCard';
import { AddWordModal } from './AddWordModal';
import { StorageService } from '../../services/storageService';
import { SRSService } from '../../services/srsService';

interface WordBankViewProps {
  words: WordEntry[];
  onWordsChanged: () => void;
  settings: UserSettings;
  onNavigateToStudy: () => void;
}

export const WordBankView: React.FC<WordBankViewProps> = ({
  words,
  onWordsChanged,
  settings,
  onNavigateToStudy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'due' | 'new' | 'learning' | 'review' | 'mastered'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered words computation
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        word.sourceText.toLowerCase().includes(q) ||
        word.translatedText.toLowerCase().includes(q) ||
        (word.notes && word.notes.toLowerCase().includes(q)) ||
        (word.tags && word.tags.some(t => t.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      // Stage / Due filter
      if (stageFilter === 'due') {
        return SRSService.isDue(word);
      }
      if (stageFilter !== 'all') {
        return word.srs.masteryStage === stageFilter;
      }

      return true;
    });
  }, [words, searchQuery, stageFilter]);

  // Handle export JSON
  const handleExportJSON = () => {
    const json = StorageService.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossa_wordbank_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle export CSV (Anki friendly)
  const handleExportCSV = () => {
    const csv = StorageService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossa_anki_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const count = StorageService.importJSON(text);
        alert(`Successfully imported ${count} new words into your dictionary!`);
        onWordsChanged();
      } catch (err: any) {
        alert(err.message || 'Import failed');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const dueWordsCount = useMemo(() => words.filter(w => SRSService.isDue(w)).length, [words]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-google-blue" />
            <span>Word Bank & Dictionary</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            {words.length} vocabulary {words.length === 1 ? 'entry' : 'entries'} saved • Auto-synced with browser storage & cookies
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dueWordsCount > 0 && (
            <button
              onClick={onNavigateToStudy}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>Review {dueWordsCount} Due Now</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-google-blue hover:bg-google-blueHover text-white flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1 transition-colors"
            title="Export for Anki / Spreadsheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1 transition-colors"
            title="Export JSON Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1 transition-colors"
            title="Import from JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search words, translations, notes, tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#202124] text-sm text-[#202124] dark:text-[#e8eaed] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-google-blue shadow-sm"
          />
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-gray-400 mr-1 hidden sm:inline" />
          {[
            { id: 'all', label: `All (${words.length})` },
            { id: 'due', label: `Due (${dueWordsCount})` },
            { id: 'new', label: 'New' },
            { id: 'learning', label: 'Learning' },
            { id: 'mastered', label: 'Mastered' }
          ].map(f => {
            const isActive = stageFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStageFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-google-blue text-white shadow-sm'
                    : 'bg-white dark:bg-[#202124] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#3c4043] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Grid */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map(word => (
            <WordItemCard
              key={word.id}
              word={word}
              onUpdate={updated => {
                StorageService.updateWord(updated);
                onWordsChanged();
              }}
              onDelete={id => {
                StorageService.deleteWord(id);
                onWordsChanged();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#202124] dark:text-[#e8eaed]">
            {searchQuery ? 'No matching words found' : 'Your Word Bank is empty'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
            {searchQuery
              ? `No words found matching "${searchQuery}". Try a different search term.`
              : 'Translate words on the Translate page and click the Star "Add to Word Bank" button to build your study collection!'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-google-blue text-white hover:bg-google-blueHover shadow-sm transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word Manually</span>
          </button>
        </div>
      )}

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWord={newWord => {
          StorageService.addWord(newWord);
          onWordsChanged();
        }}
        defaultSourceLang={settings.sourceLang}
        defaultTargetLang={settings.targetLang}
      />

    </div>
  );
};
