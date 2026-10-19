import React from 'react';
import { Sparkles, Crown, Zap, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { PlanTier } from '../types';
import { PLAN_LIMITS } from '../utils/planLimits';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
  currentPlan: PlanTier;
  limitType: 'images' | 'messages';
  usedCount: number;
}

export const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  currentPlan,
  limitType,
  usedCount,
}) => {
  if (!isOpen) return null;

  const maxLimit =
    limitType === 'images'
      ? PLAN_LIMITS[currentPlan].dailyImages
      : PLAN_LIMITS[currentPlan].dailyMessages;

  const title =
    limitType === 'images'
      ? 'Limite diário de imagens atingido'
      : 'Limite diário de mensagens atingido';

  const subtitle =
    currentPlan === 'base'
      ? `Você utilizou todas as ${maxLimit} ${limitType === 'images' ? 'gerações de imagem' : 'mensagens'} diárias do seu Plano Base.`
      : `Você atingiu o limite de ${maxLimit} ${limitType === 'images' ? 'gerações de imagem' : 'mensagens'} diárias do seu Plano Medium.`;

  return (
    <div
      id="plan-limit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="plan-limit-modal-card"
        className="relative max-w-md w-full bg-[#0b1021] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/30 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-limit-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-indigo-950/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[1.5px] shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60">
              {currentPlan === 'base' ? 'Plano Base' : 'Plano Medium'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">{title}</h3>
          </div>
        </div>

        {/* Description & Quota Bar */}
        <div className="bg-[#070b16] border border-indigo-950/80 rounded-2xl p-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{subtitle}</p>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Uso diário ({limitType === 'images' ? 'Imagens' : 'Mensagens'})</span>
              <span className="text-amber-400">
                {usedCount}/{maxLimit} (100%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-full" />
            </div>
            <p className="text-[11px] text-slate-500">
              O limite é renovado automaticamente à meia-noite.
            </p>
          </div>
        </div>

        {/* Upgrade Card Comparison */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Escolha como deseja continuar:
          </p>

          {currentPlan === 'base' && (
            <div
              onClick={() => {
                onClose();
                onOpenPlans();
              }}
              className="p-3.5 bg-gradient-to-r from-indigo-950/40 to-blue-950/30 hover:from-indigo-900/50 hover:to-blue-900/40 border border-indigo-800/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Plano Medium (50 imagens/dia)
                  </h4>
                  <p className="text-xs text-slate-400">Apenas R$ 29,90/mês</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          )}

          <div
            onClick={() => {
              onClose();
              onOpenPlans();
            }}
            className="p-3.5 bg-gradient-to-r from-purple-950/50 to-pink-950/40 hover:from-purple-900/60 hover:to-pink-900/50 border border-purple-800/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-400">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Plano Premium (ILIMITADO ∞)
                </h4>
                <p className="text-xs text-slate-400">Sem limites de geração ou chat</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-limit-cancel"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-indigo-900/80 text-sm font-semibold text-slate-300 hover:text-white hover:bg-indigo-950/60 transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <button
            id="btn-limit-upgrade"
            onClick={() => {
              onClose();
              onOpenPlans();
            }}
            className="flex-[1.4] py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fazer Upgrade Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
