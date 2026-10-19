import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { AVAILABLE_LANGUAGES } from '../utils/languages';
import { LanguageOption } from '../types';

interface LanguageSelectorProps {
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang =
    AVAILABLE_LANGUAGES.find((l) => l.code === currentLanguage) ||
    AVAILABLE_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        id="btn-language-selector"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-900/50 bg-[#0c1326] hover:bg-[#121c38] text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm ${
          compact ? 'text-xs' : 'text-xs sm:text-sm font-medium'
        }`}
        title="Selecionar Idioma da IA / Select Language"
      >
        <span className="text-sm leading-none">{selectedLang.flag}</span>
        <span className="font-semibold text-slate-200 hidden sm:inline">
          {compact ? selectedLang.code.split('-')[0].toUpperCase() : selectedLang.nativeName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#0b1122] border border-indigo-900/80 shadow-2xl shadow-purple-950/40 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          <div className="px-3 py-1.5 border-b border-indigo-950/80 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <Globe className="w-3 h-3" />
            <span>Idioma da IA</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/70 text-purple-200 font-semibold border-l-2 border-purple-500'
                      : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="text-left">
                      <span className="block text-slate-200 font-medium">{lang.nativeName}</span>
                      <span className="block text-[10px] text-slate-500">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
