import React, { useState } from 'react';
import { X, Globe, Key, Database, RefreshCw, Check } from 'lucide-react';
import { UserSettings } from '../../types';
import { CookieUtil } from '../../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  wordCount: number;
  onResetSampleData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  wordCount,
  onResetSampleData
}) => {
  const [engine, setEngine] = useState(settings.engine);
  const [deeplKey, setDeeplKey] = useState(settings.deeplApiKey || '');
  const [libreUrl, setLibreUrl] = useState(settings.libreCustomUrl || '');
  const [autoTranslate, setAutoTranslate] = useState(settings.autoTranslate);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      engine,
      deeplApiKey: deeplKey.trim(),
      libreCustomUrl: libreUrl.trim(),
      autoTranslate
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  // Inspect cookies for user transparency
  const cookieDict = CookieUtil.get('tc_added_dictionary') || 'None';
  const cookieSource = CookieUtil.get('tc_source_lang') || 'en';
  const cookieTarget = CookieUtil.get('tc_target_lang') || 'es';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-[#202124] w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-google-blue" />
            <h2 className="text-lg font-bold text-[#202124] dark:text-[#e8eaed]">
              Glossa Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1">
          
          {/* Translation Engine Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Translation API Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'google', name: 'Google Translate', desc: 'Free web client (Zero-config)' },
                { id: 'mymemory', name: 'MyMemory API', desc: 'Public community translation memory' },
                { id: 'libre', name: 'LibreTranslate', desc: 'Open-source or custom URL' },
                { id: 'deepl', name: 'DeepL API', desc: 'User API key required' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEngine(item.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    engine === item.id
                      ? 'border-google-blue bg-blue-50/50 dark:bg-blue-950/40 text-google-blue dark:text-blue-400 font-semibold'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional API keys */}
          {engine === 'deepl' && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>DeepL API Key</span>
              </label>
              <input
                type="password"
                value={deeplKey}
                onChange={e => setDeeplKey(e.target.value)}
                placeholder="Enter DeepL Free or Pro API Key"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400">Stored safely in your browser only.</p>
            </div>
          )}

          {engine === 'libre' && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                LibreTranslate Custom Instance URL
              </label>
              <input
                type="url"
                value={libreUrl}
                onChange={e => setLibreUrl(e.target.value)}
                placeholder="https://translate.argosopentech.com/translate"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none"
              />
            </div>
          )}

          {/* Auto Translate Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Auto-translate while typing
              </div>
              <div className="text-xs text-gray-400">
                Translates automatically after 500ms debounce pause
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={e => setAutoTranslate(e.target.checked)}
              className="w-5 h-5 text-google-blue rounded focus:ring-google-blue cursor-pointer"
            />
          </div>

          {/* Storage & Cookie Diagnostics */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Database className="w-3.5 h-3.5" />
              <span>Cookies & Storage Status</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 font-mono">
              <div>• Cookie Langs: <span className="font-semibold">{cookieSource} → {cookieTarget}</span></div>
              <div>• Word Bank Entries: <span className="font-semibold">{wordCount}</span></div>
              <div className="truncate">• Cookie Added Dictionary: <span className="text-gray-400">{cookieDict.slice(0, 45)}...</span></div>
            </div>
          </div>

          {/* Reset / Sample Data */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Load sample starter vocabulary into your Word Bank?')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="text-xs text-gray-500 hover:text-google-blue flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset / Restore Starter Words</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-google-blue text-white hover:bg-google-blueHover shadow-sm flex items-center space-x-1"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : null}
            <span>{savedNotice ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
