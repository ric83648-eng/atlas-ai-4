import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MessageSquare, Sparkles, X, Search, Clock, Crown, Zap, Shield, ChevronRight, ImageIcon } from 'lucide-react';
import { ChatSession, PlanTier } from '../types';
import { getTranslation } from '../utils/languages';
import { getDailyUsage, PLAN_LIMITS } from '../utils/planLimits';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAllSessions: () => void;
  onOpenPlans: () => void;
  currentPlan: PlanTier;
  language: string;
  refreshUsageKey?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
  onOpenPlans,
  currentPlan,
  language,
  refreshUsageKey = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [usage, setUsage] = useState(getDailyUsage());

  useEffect(() => {
    setUsage(getDailyUsage());
  }, [refreshUsageKey, currentPlan, sessions]);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const planNames: Record<PlanTier, string> = {
    base: 'Plano Base',
    medium: 'Plano Medium',
    premium: 'Plano Premium',
  };

  const planLimits = PLAN_LIMITS[currentPlan];
  const isUnlimited = currentPlan === 'premium';

  const imagePercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((usage.imagesCount / planLimits.dailyImages) * 100));

  const messagePercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((usage.messagesCount / planLimits.dailyMessages) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 sm:w-80 bg-[#070c17] border-r border-indigo-950/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : ''}`}
      >
        {/* Top bar */}
        <div className="p-4 border-b border-indigo-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              {getTranslation(language, 'history')}
            </h2>
          </div>
          <button
            id="btn-close-sidebar-mobile"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            id="btn-sidebar-new-chat"
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-950/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{getTranslation(language, 'newChat')}</span>
          </button>
        </div>

        {/* Search filter */}
        {sessions.length > 3 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="input-search-sessions"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation(language, 'searchChats')}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0b1122] border border-indigo-950 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        )}

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare className="w-8 h-8 mx-auto text-indigo-950 mb-2" />
              <p className="text-xs text-slate-500">
                {searchQuery
                  ? getTranslation(language, 'noChatsFound')
                  : getTranslation(language, 'noChats')}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const dateStr = new Date(session.updatedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-950/80 text-white border border-indigo-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1326]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-indigo-400'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate text-xs sm:text-[13px]">{session.title}</p>
                      <span className="text-[10px] text-slate-500 block">{dateStr}</span>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-session-${session.id}`}
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-opacity cursor-pointer"
                    title="Excluir conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* PLANS & DAILY USAGE LIMITS CARD */}
        <div className="p-3 border-t border-indigo-950/90 bg-gradient-to-b from-[#080d1c] to-[#060a14] space-y-2.5">
          {/* Daily Quota Tracking */}
          <div className="bg-[#0a1022] border border-indigo-900/60 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                {planNames[currentPlan]}
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-800/60">
                {isUnlimited ? 'ILIMITADO ∞' : `${currentPlan.toUpperCase()}`}
              </span>
            </div>

            {/* Images Usage Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-blue-400" />
                  Imagens hoje
                </span>
                <span className="font-semibold text-slate-200">
                  {isUnlimited ? '∞ Ilimitado' : `${usage.imagesCount}/${planLimits.dailyImages}`}
                </span>
              </div>
              {!isUnlimited && (
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      imagePercent >= 100
                        ? 'bg-rose-500'
                        : imagePercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${imagePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Messages Usage Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  Mensagens hoje
                </span>
                <span className="font-semibold text-slate-200">
                  {isUnlimited ? '∞ Ilimitado' : `${usage.messagesCount}/${planLimits.dailyMessages}`}
                </span>
              </div>
              {!isUnlimited && (
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      messagePercent >= 100
                        ? 'bg-rose-500'
                        : messagePercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${messagePercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* PLANS UPGRADE BUTTON */}
          <button
            id="btn-sidebar-plans"
            onClick={onOpenPlans}
            className="w-full relative group overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 cursor-pointer shadow-md text-left"
          >
            <div className="bg-[#0b1124] group-hover:bg-[#0e162f] px-3 py-2 rounded-[11px] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">
                  {currentPlan === 'premium' ? 'Gerenciar Plano' : 'Aumentar Limite / Planos'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Clear all chats button */}
          {sessions.length > 1 && (
            <button
              id="btn-clear-all-sessions"
              onClick={onClearAllSessions}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{getTranslation(language, 'clearAll')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
