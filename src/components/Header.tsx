import React from 'react';
import { MessageSquare, Sparkles, Image as ImageIcon, Settings, PanelLeft, Plus, Crown } from 'lucide-react';
import { AppMode, PlanTier } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/languages';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenPlans: () => void;
  language: string;
  onSelectLanguage: (code: string) => void;
  currentPlan: PlanTier;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onOpenPlans,
  language,
  onSelectLanguage,
  currentPlan,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-indigo-950/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4"
    >
      {/* Left branding & sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-200 hover:bg-indigo-950/60 border border-indigo-900/30 transition-colors cursor-pointer"
          title="Histórico de conversas"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Atlas AI Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Atlas AI
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/40">
                v3.8
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 -mt-0.5">
              Perguntas, Raciocínio & Criação Visual
            </p>
          </div>
        </div>
      </div>

      {/* Center Navigation Mode Switcher */}
      <div
        id="mode-nav-tabs"
        className="flex items-center p-1 bg-[#0b1224] rounded-xl border border-indigo-950 shadow-inner"
      >
        <button
          id="tab-mode-chat"
          onClick={() => onSelectMode('chat')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            currentMode === 'chat'
              ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/40'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-300" />
          <span className="hidden xs:inline">{getTranslation(language, 'chatTab')}</span>
        </button>

        <button
          id="tab-mode-image"
          onClick={() => onSelectMode('image-studio')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            currentMode === 'image-studio'
              ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-purple-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/40'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-purple-300" />
          <span className="hidden xs:inline">{getTranslation(language, 'imageTab')}</span>
        </button>
      </div>

      {/* Right controls: Language Selector, Plans, New Chat & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Selector Dropdown */}
        <LanguageSelector
          currentLanguage={language}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Plans shortcut */}
        <button
          id="btn-header-plans"
          onClick={onOpenPlans}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 hover:from-amber-500/25 hover:to-purple-500/25 border border-purple-800/50 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer shadow-sm"
          title="Ver Planos Base, Medium e Premium"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Planos</span>
        </button>

        {/* New Chat Button */}
        <button
          id="btn-header-new-chat"
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-xs font-semibold text-indigo-200 hover:text-white border border-indigo-900/50 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(language, 'newChat')}</span>
        </button>

        {/* Settings button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 border border-indigo-900/30 transition-colors cursor-pointer"
          title="Configurações & Persona do Atlas"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
