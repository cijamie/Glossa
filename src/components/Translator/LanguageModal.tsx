import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { ALL_LANGUAGES } from '../../data/languages';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelect: (code: string) => void;
  isSource?: boolean;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelect,
  isSource = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    let list = ALL_LANGUAGES;
    // For target language, 'auto' is not allowed
    if (!isSource) {
      list = list.filter(l => l.code !== 'auto');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      l => l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [searchQuery, isSource]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-[#202124] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 mr-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search languages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#202124] dark:text-[#e8eaed] placeholder-gray-400 focus:outline-none text-base"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Languages Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredLanguages.map(lang => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-google-blue dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="truncate">
                  <div className="truncate font-medium">{lang.name}</div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{lang.native}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 ml-1 flex-shrink-0 text-google-blue" />}
              </button>
            );
          })}
          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              No languages found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
