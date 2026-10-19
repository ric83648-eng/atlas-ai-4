import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Shield, ArrowRight, DollarSign, CreditCard } from 'lucide-react';
import { Currency, PlanTier, PlanInfo } from '../types';
import { CheckoutModal } from './CheckoutModal';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<'medium' | 'premium' | null>(null);

  if (!isOpen) return null;

  const plans: PlanInfo[] = [
    {
      id: 'base',
      name: 'Plano Base',
      tagline: 'Ideal para tarefas cotidianas e experimentação',
      priceBRL: 'R$ 0',
      priceUSD: '$0',
      rawPriceBRL: 0,
      rawPriceUSD: 0,
      periodBRL: '/mês',
      periodUSD: '/mo',
      popular: false,
      limits: {
        dailyImages: 5,
        dailyMessages: 25,
        webSearchForImages: true,
        maxQuality: 'HD',
      },
      features: [
        'Limite de 5 imagens geradas por dia',
        'Limite de 25 mensagens de chat por dia',
        'Pesquisa na Web para criação de imagens reais',
        'Modelos Atlas 3.7 Flash & FLUX.1 Diffusion',
        'Histórico de conversas salvo localmente',
        'Qualidade de renderização HD',
      ],
      ctaLabel: 'Plano Gratuito',
    },
    {
      id: 'medium',
      name: 'Plano Medium',
      tagline: 'Para profissionais, criadores e estudantes',
      priceBRL: billingCycle === 'monthly' ? 'R$ 29,90' : 'R$ 24,90',
      priceUSD: billingCycle === 'monthly' ? '$5.90' : '$4.90',
      rawPriceBRL: billingCycle === 'monthly' ? 29.90 : 24.90 * 12,
      rawPriceUSD: billingCycle === 'monthly' ? 5.90 : 4.90 * 12,
      periodBRL: '/mês',
      periodUSD: '/mo',
      popular: true,
      limits: {
        dailyImages: 50,
        dailyMessages: 250,
        webSearchForImages: true,
        maxQuality: 'Full HD',
      },
      features: [
        'Limite estendido de 50 imagens por dia',
        'Limite estendido de 250 mensagens por dia',
        'Pesquisa Web em tempo real para imagens e fatos',
        'Geração em alta fidelidade Full HD',
        'Velocidade 3x mais rápida sem filas de espera',
        'Análise de fotos e documentos',
        'Todos os estilos artísticos e proporções',
      ],
      ctaLabel: 'Ir para Pagamento (Medium)',
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      tagline: 'O poder máximo do Atlas AI sem nenhuma restrição',
      priceBRL: billingCycle === 'monthly' ? 'R$ 59,90' : 'R$ 49,90',
      priceUSD: billingCycle === 'monthly' ? '$11.90' : '$9.90',
      rawPriceBRL: billingCycle === 'monthly' ? 59.90 : 49.90 * 12,
      rawPriceUSD: billingCycle === 'monthly' ? 11.90 : 9.90 * 12,
      periodBRL: '/mês',
      periodUSD: '/mo',
      popular: false,
      limits: {
        dailyImages: 999999,
        dailyMessages: 999999,
        webSearchForImages: true,
        maxQuality: '4K Ultra',
      },
      features: [
        'Uso ILIMITADO (∞) de geração de imagens',
        'Uso ILIMITADO (∞) de conversas e mensagens',
        'Pesquisa Web em tempo real profunda e grounding visual',
        'Renderização 4K Ultra e variações ilimitadas',
        'Acesso prioritário instantâneo sem fila',
        'Personalização ilimitada de personas e instruções',
        'Suporte VIP 24/7 dedicado',
      ],
      ctaLabel: 'Ir para Pagamento (Premium)',
    },
  ];

  const handleChoosePlan = (planId: PlanTier) => {
    if (planId === 'base') {
      onSelectPlan('base');
      setSuccessToast('Plano Base ativado com sucesso!');
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1200);
    } else {
      // Open Checkout page for Medium or Premium
      setCheckoutTier(planId);
    }
  };

  const handlePaymentSuccess = (plan: PlanTier) => {
    onSelectPlan(plan);
    setCheckoutTier(null);
    setSuccessToast(`Plano ${plan === 'medium' ? 'Medium' : 'Premium'} ativado com sucesso!`);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div
        id="plans-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          id="plans-modal-card"
          className="relative max-w-5xl w-full bg-[#090e1a] border border-indigo-900/70 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/40 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-indigo-950 bg-[#060a14] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-[#090e1a] rounded-[14px] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Planos & Assinaturas do <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Atlas AI</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Escolha o plano ideal para suas necessidades: Base, Medium ou Premium.
                </p>
              </div>
            </div>

            <button
              id="btn-close-plans-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Currency & Billing Switcher */}
          <div className="px-6 py-3.5 bg-[#0a1020] border-b border-indigo-950/80 flex flex-wrap items-center justify-between gap-3">
            {/* Currency Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Moeda:</span>
              <div className="flex items-center p-1 bg-[#060a14] rounded-xl border border-indigo-900/60 shadow-inner">
                <button
                  id="btn-currency-brl"
                  onClick={() => setCurrency('BRL')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === 'BRL'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇧🇷 Reais (R$)</span>
                </button>
                <button
                  id="btn-currency-usd"
                  onClick={() => setCurrency('USD')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇺🇸 Dolls / USD ($)</span>
                </button>
              </div>
            </div>

            {/* Billing cycle */}
            <div className="flex items-center gap-1.5 p-1 bg-[#060a14] rounded-xl border border-indigo-900/60 text-xs">
              <button
                id="btn-cycle-monthly"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-950 text-indigo-200 border border-indigo-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                id="btn-cycle-annual"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-purple-950 text-purple-200 border border-purple-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  -20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Toast notification */}
          {successToast && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Plans Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const displayPrice = currency === 'BRL' ? plan.priceBRL : plan.priceUSD;
                const displayPeriod = currency === 'BRL' ? plan.periodBRL : plan.periodUSD;

                return (
                  <div
                    key={plan.id}
                    id={`plan-card-${plan.id}`}
                    className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-b from-[#141238] via-[#0d132b] to-[#070b17] border-2 border-purple-500 shadow-xl shadow-purple-950/50 scale-[1.02]'
                        : 'bg-[#080d1a] border border-indigo-950/90 hover:border-indigo-800'
                    } p-5 sm:p-6`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                        Mais Popular
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {plan.id === 'base' && <Shield className="w-5 h-5 text-blue-400" />}
                          {plan.id === 'medium' && <Zap className="w-5 h-5 text-purple-400" />}
                          {plan.id === 'premium' && <Crown className="w-5 h-5 text-amber-400" />}
                          <h3 className="text-base sm:text-lg font-bold text-white">{plan.name}</h3>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-800">
                            Plano Atual
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 min-h-[32px] leading-relaxed mb-4">
                        {plan.tagline}
                      </p>

                      {/* Price display in selected currency */}
                      <div className="mb-5 pb-5 border-b border-indigo-950">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {displayPrice}
                          </span>
                          <span className="text-xs text-slate-400">{displayPeriod}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {currency === 'BRL'
                            ? `Equivalente a ${plan.priceUSD} em dólares`
                            : `Equivalent to ${plan.priceBRL} in Reais`}
                        </p>
                      </div>

                      {/* Feature list */}
                      <div className="space-y-2.5 mb-6">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                          O que está incluso:
                        </p>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                      <button
                        id={`btn-select-plan-${plan.id}`}
                        onClick={() => handleChoosePlan(plan.id)}
                        disabled={isCurrent}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-950/60 text-slate-400 border border-indigo-900/60 cursor-default'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-950/40'
                            : 'bg-[#0e162c] hover:bg-[#152040] text-slate-200 hover:text-white border border-indigo-900/80'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Seu Plano Ativo</span>
                          </>
                        ) : plan.id === 'base' ? (
                          <>
                            <span>{plan.ctaLabel}</span>
                            <ArrowRight className="w-4 h-4 ml-0.5" />
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>{plan.ctaLabel}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="p-4 border-t border-indigo-950 bg-[#060a14] flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Checkout seguro com Pix, Cartão de Crédito, Boleto e PayPal</span>
            </span>
            <span>Atlas AI Subscription Engine v3.7</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal Popup when Medium or Premium is selected */}
      {checkoutTier && (
        <CheckoutModal
          isOpen={!!checkoutTier}
          onClose={() => setCheckoutTier(null)}
          planTier={checkoutTier}
          currency={currency}
          onCurrencyChange={(c) => setCurrency(c)}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

