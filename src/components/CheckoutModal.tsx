import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  QrCode,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  Crown,
  Copy,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  Calendar,
  User,
  Hash,
  FileText,
  DollarSign
} from 'lucide-react';
import { Currency, PaymentMethod, PlanTier } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTier: 'medium' | 'premium';
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  billingCycle: 'monthly' | 'annual';
  onSuccess: (plan: PlanTier) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  planTier,
  currency,
  onCurrencyChange,
  billingCycle,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    currency === 'BRL' ? 'pix' : 'credit_card'
  );

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');
  const [cpf, setCpf] = useState('');

  // Pix state
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimer, setPixTimer] = useState(900); // 15 mins

  // Processing & Success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Switch default payment method when currency changes
  useEffect(() => {
    if (currency === 'USD' && paymentMethod === 'pix') {
      setPaymentMethod('credit_card');
    }
  }, [currency, paymentMethod]);

  // Pix countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isOpen && paymentMethod === 'pix' && !isSuccess) {
      interval = setInterval(() => {
        setPixTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, paymentMethod, isSuccess]);

  if (!isOpen) return null;

  const planName = planTier === 'medium' ? 'Plano Medium' : 'Plano Premium';
  const isMedium = planTier === 'medium';

  // Pricing calculations
  const priceBRL =
    planTier === 'medium'
      ? billingCycle === 'monthly'
        ? 29.90
        : 24.90 * 12
      : billingCycle === 'monthly'
      ? 59.90
      : 49.90 * 12;

  const priceUSD =
    planTier === 'medium'
      ? billingCycle === 'monthly'
        ? 5.90
        : 4.90 * 12
      : billingCycle === 'monthly'
      ? 11.90
      : 9.90 * 12;

  const displayPrice =
    currency === 'BRL'
      ? billingCycle === 'monthly'
        ? `R$ ${priceBRL.toFixed(2).replace('.', ',')}/mês`
        : `R$ ${priceBRL.toFixed(2).replace('.', ',')}/ano`
      : billingCycle === 'monthly'
      ? `$${priceUSD.toFixed(2)}/mo`
      : `$${priceUSD.toFixed(2)}/yr`;

  const rawTotal = currency === 'BRL' ? priceBRL : priceUSD;

  // Format Card Number (with spaces)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Expiry MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardExpiry(value);
  };

  // Format CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    setCpf(value);
  };

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136atlas-ai-pay-${planTier}-${Date.now()}520400005303986540${rawTotal.toFixed(2)}5802BR5916ATLAS AI INTEL6009SAO PAULO62070503***6304D1A4`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // Execute Simulated Payment Flow
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep('Iniciando comunicação criptografada...');

    setTimeout(() => {
      setProcessingStep('Verificando dados e autorização bancária...');
    }, 900);

    setTimeout(() => {
      setProcessingStep(`Provisionando recursos exclusivos do ${planName}...`);
    }, 1800);

    setTimeout(() => {
      const generatedTx = `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setTransactionId(generatedTx);
      setIsProcessing(false);
      setIsSuccess(true);
      onSuccess(planTier);
    }, 2800);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        id="checkout-modal-card"
        className="relative max-w-4xl w-full bg-[#080d1a] border border-indigo-900/80 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Banner */}
        <div className="p-4 sm:p-5 border-b border-indigo-950 bg-[#060914] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl p-[1.5px] shadow-lg flex items-center justify-center ${
                isMedium
                  ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600'
                  : 'bg-gradient-to-tr from-amber-400 via-purple-600 to-indigo-600'
              }`}
            >
              <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                {isMedium ? (
                  <Zap className="w-5 h-5 text-purple-400" />
                ) : (
                  <Crown className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Checkout Seguro • {planName}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isMedium
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  {billingCycle === 'monthly' ? 'Mensal' : 'Anual -20% OFF'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Ambiente Seguro com Criptografia SSL de 256 bits</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-checkout"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Switcher in Header */}
        <div className="px-5 py-2.5 bg-[#0a1022] border-b border-indigo-950/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Moeda de pagamento:</span>
            <div className="flex items-center p-0.5 bg-[#060913] rounded-lg border border-indigo-900/60">
              <button
                id="btn-checkout-currency-brl"
                type="button"
                onClick={() => onCurrencyChange('BRL')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  currency === 'BRL'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇧🇷 BRL (R$)
              </button>
              <button
                id="btn-checkout-currency-usd"
                type="button"
                onClick={() => onCurrencyChange('USD')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 USD ($ Dolls)
              </button>
            </div>
          </div>

          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="text-slate-500">Valor Total:</span>
            <span className="text-sm sm:text-base font-extrabold text-purple-300">
              {displayPrice}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isSuccess ? (
            /* SUCCESS STATE */
            <div
              id="checkout-success-view"
              className="py-6 sm:py-10 max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300"
            >
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 p-[2px] shadow-2xl">
                  <div className="w-full h-full bg-[#080d1a] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">
                  Pagamento Confirmado com Sucesso!
                </h3>
                <p className="text-sm text-slate-300">
                  Parabéns! Seu <strong className="text-purple-300">{planName}</strong> do Atlas AI já está 100% ativo em sua conta.
                </p>
              </div>

              {/* Receipt info card */}
              <div className="p-4 rounded-2xl bg-[#0d1428] border border-indigo-900/60 text-left space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-indigo-950/80 pb-2">
                  <span className="text-slate-500">Código da Transação:</span>
                  <span className="font-mono font-bold text-indigo-300">{transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-950/80 pb-2">
                  <span className="text-slate-500">Plano Selecionado:</span>
                  <span className="font-bold text-white">{planName} ({billingCycle === 'monthly' ? 'Mensal' : 'Anual'})</span>
                </div>
                <div className="flex justify-between border-b border-indigo-950/80 pb-2">
                  <span className="text-slate-500">Valor Pago:</span>
                  <span className="font-extrabold text-emerald-400">{displayPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Aprovado & Liberado
                  </span>
                </div>
              </div>

              <button
                id="btn-return-app-after-payment"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acessar Recursos do {planName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isProcessing ? (
            /* PROCESSING LOADER */
            <div
              id="checkout-processing-view"
              className="py-12 sm:py-16 text-center max-w-md mx-auto space-y-6 animate-in fade-in"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] mx-auto shadow-xl">
                <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Processando Pagamento Seguro</h3>
                <p className="text-xs text-purple-300 font-medium animate-pulse">
                  {processingStep}
                </p>
                <p className="text-[11px] text-slate-500">
                  Por favor, não feche esta janela enquanto autenticamos a operação.
                </p>
              </div>
            </div>
          ) : (
            /* MAIN CHECKOUT FORM */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Payment Methods & Forms (8 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2.5">
                    Escolha a Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Pix (available for BRL) */}
                    {currency === 'BRL' && (
                      <button
                        id="tab-pay-pix"
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                          paymentMethod === 'pix'
                            ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                            : 'bg-[#0b1224] border-indigo-950 text-slate-400 hover:border-indigo-800'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold">PIX</span>
                        <span className="text-[9px] text-emerald-400 font-medium">Instantâneo</span>
                      </button>
                    )}

                    {/* Credit Card */}
                    <button
                      id="tab-pay-card"
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                        paymentMethod === 'credit_card'
                          ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                          : 'bg-[#0b1224] border-indigo-950 text-slate-400 hover:border-indigo-800'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold">Cartão</span>
                      <span className="text-[9px] text-slate-500">Crédito</span>
                    </button>

                    {/* PayPal */}
                    <button
                      id="tab-pay-paypal"
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                        paymentMethod === 'paypal'
                          ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                          : 'bg-[#0b1224] border-indigo-950 text-slate-400 hover:border-indigo-800'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold">PayPal</span>
                      <span className="text-[9px] text-slate-500">Digital</span>
                    </button>

                    {/* Boleto (BRL only) */}
                    {currency === 'BRL' && (
                      <button
                        id="tab-pay-boleto"
                        type="button"
                        onClick={() => setPaymentMethod('boleto')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                          paymentMethod === 'boleto'
                            ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                            : 'bg-[#0b1224] border-indigo-950 text-slate-400 hover:border-indigo-800'
                        }`}
                      >
                        <FileText className="w-5 h-5 text-slate-300" />
                        <span className="text-xs font-bold">Boleto</span>
                        <span className="text-[9px] text-slate-500">Compensação</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* --- METHOD 1: PIX --- */}
                {paymentMethod === 'pix' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1022] border border-indigo-950 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <QrCode className="w-4 h-4" />
                        <span>Pague via PIX Instantâneo</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <span>Expira em:</span>
                        <span className="text-amber-400 font-bold">{formatTimer(pixTimer)}</span>
                      </div>
                    </div>

                    {/* Realistic SVG QR Code Display */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#060a16] border border-indigo-900/60">
                      <div className="w-36 h-36 bg-white p-2.5 rounded-xl shadow-lg flex items-center justify-center shrink-0">
                        {/* High-contrast generated styled SVG QR Matrix */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                          {/* Corner Squares */}
                          <rect x="5" y="5" width="26" height="26" rx="2" />
                          <rect x="9" y="9" width="18" height="18" fill="white" />
                          <rect x="13" y="13" width="10" height="10" />

                          <rect x="69" y="5" width="26" height="26" rx="2" />
                          <rect x="73" y="9" width="18" height="18" fill="white" />
                          <rect x="77" y="13" width="10" height="10" />

                          <rect x="5" y="69" width="26" height="26" rx="2" />
                          <rect x="9" y="73" width="18" height="18" fill="white" />
                          <rect x="13" y="77" width="10" height="10" />

                          {/* Data points */}
                          <rect x="36" y="8" width="6" height="6" />
                          <rect x="46" y="8" width="6" height="6" />
                          <rect x="56" y="8" width="6" height="6" />
                          <rect x="36" y="18" width="6" height="6" />
                          <rect x="46" y="24" width="6" height="6" />
                          <rect x="56" y="18" width="6" height="6" />
                          <rect x="8" y="36" width="6" height="6" />
                          <rect x="18" y="36" width="6" height="6" />
                          <rect x="28" y="36" width="6" height="6" />
                          <rect x="38" y="38" width="6" height="6" />
                          <rect x="48" y="38" width="6" height="6" />
                          <rect x="58" y="38" width="6" height="6" />
                          <rect x="68" y="36" width="6" height="6" />
                          <rect x="78" y="36" width="6" height="6" />
                          <rect x="88" y="36" width="6" height="6" />

                          <rect x="8" y="48" width="6" height="6" />
                          <rect x="24" y="48" width="6" height="6" />
                          <rect x="36" y="48" width="6" height="6" />
                          <rect x="48" y="48" width="6" height="6" />
                          <rect x="60" y="48" width="6" height="6" />
                          <rect x="72" y="48" width="6" height="6" />
                          <rect x="86" y="48" width="6" height="6" />

                          <rect x="36" y="60" width="6" height="6" />
                          <rect x="46" y="60" width="6" height="6" />
                          <rect x="56" y="60" width="6" height="6" />
                          <rect x="68" y="60" width="6" height="6" />
                          <rect x="80" y="60" width="6" height="6" />

                          <rect x="36" y="74" width="6" height="6" />
                          <rect x="48" y="74" width="6" height="6" />
                          <rect x="60" y="74" width="6" height="6" />
                          <rect x="76" y="74" width="6" height="6" />
                          <rect x="86" y="74" width="6" height="6" />

                          <rect x="36" y="86" width="6" height="6" />
                          <rect x="50" y="86" width="6" height="6" />
                          <rect x="64" y="86" width="6" height="6" />
                          <rect x="78" y="86" width="6" height="6" />
                        </svg>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 text-center sm:text-left">
                        <p className="font-bold text-white">Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                          <li>Abra o aplicativo do seu banco favorito</li>
                          <li>Escolha a opção <strong>Pagar via Pix / QR Code</strong></li>
                          <li>Aponte a câmera para o QR Code ou copie o código abaixo</li>
                        </ol>
                      </div>
                    </div>

                    {/* Copy and Paste code */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Código PIX Copia e Cola:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="input-pix-code"
                          type="text"
                          readOnly
                          value={pixCode}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#060914] border border-indigo-950 text-xs font-mono text-slate-300 focus:outline-none select-all truncate"
                        />
                        <button
                          id="btn-copy-pix"
                          type="button"
                          onClick={handleCopyPix}
                          className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-xs font-bold text-purple-200 border border-purple-800 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Confirmation CTA */}
                    <button
                      id="btn-confirm-pix-payment"
                      type="button"
                      onClick={handleSubmitPayment}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Já fiz o Pix / Confirmar Pagamento</span>
                    </button>
                  </div>
                )}

                {/* --- METHOD 2: CREDIT CARD --- */}
                {paymentMethod === 'credit_card' && (
                  <form onSubmit={handleSubmitPayment} className="space-y-4 animate-in fade-in">
                    {/* Animated Virtual Card Preview */}
                    <div className="relative w-full h-44 sm:h-48 rounded-2xl p-5 bg-gradient-to-br from-[#1c1242] via-[#0f1738] to-[#070b18] border border-purple-500/40 shadow-xl shadow-purple-950/50 flex flex-col justify-between overflow-hidden">
                      {/* Hologram / Glow effect */}
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl" />
                      <div className="absolute -left-8 -top-8 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl" />

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-300" />
                          <span className="text-xs font-extrabold tracking-widest text-slate-200 uppercase">
                            Atlas AI Pass
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-rose-500/80 opacity-90" />
                          <div className="w-6 h-6 rounded-full bg-amber-500/80 -ml-3 opacity-90" />
                        </div>
                      </div>

                      {/* Chip */}
                      <div className="relative w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-amber-100 border border-amber-400 shadow-sm opacity-90" />

                      {/* Card Number display */}
                      <div className="relative font-mono text-sm sm:text-base font-bold tracking-widest text-white">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      {/* Card Holder & Expiry */}
                      <div className="relative flex items-center justify-between text-xs text-slate-300">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Titular</span>
                          <span className="font-semibold uppercase tracking-wider text-xs truncate max-w-[180px] block">
                            {cardHolder || 'NOME NO CARTÃO'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Validade</span>
                          <span className="font-mono font-semibold text-xs">{cardExpiry || 'MM/AA'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Número do Cartão de Crédito
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="input-card-number"
                            type="text"
                            required
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nome Impresso no Cartão
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="input-card-holder"
                            type="text"
                            required
                            placeholder="Nome Completo"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Validade (MM/AA)
                          </label>
                          <input
                            id="input-card-expiry"
                            type="text"
                            required
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            id="input-card-cvv"
                            type="password"
                            required
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-center"
                          />
                        </div>

                        {currency === 'BRL' && (
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              CPF do Titular
                            </label>
                            <input
                              id="input-card-cpf"
                              type="text"
                              required
                              placeholder="000.000.000-00"
                              value={cpf}
                              onChange={handleCpfChange}
                              maxLength={14}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        )}
                      </div>

                      {currency === 'BRL' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Parcelamento
                          </label>
                          <select
                            id="select-installments"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0a1022] border border-indigo-950 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                          >
                            <option value="1">1x de R$ {rawTotal.toFixed(2).replace('.', ',')} (sem juros)</option>
                            <option value="2">2x de R$ {(rawTotal / 2).toFixed(2).replace('.', ',')} (sem juros)</option>
                            <option value="3">3x de R$ {(rawTotal / 3).toFixed(2).replace('.', ',')} (sem juros)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <button
                      id="btn-submit-card-payment"
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Confirmar Assinatura ({displayPrice})</span>
                    </button>
                  </form>
                )}

                {/* --- METHOD 3: PAYPAL --- */}
                {paymentMethod === 'paypal' && (
                  <div className="p-5 rounded-2xl bg-[#0a1022] border border-indigo-950 space-y-4 animate-in fade-in text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                      <DollarSign className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Checkout Rápido com PayPal</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Conecte sua conta PayPal para cobrança automática segura em USD ou BRL com Proteção ao Comprador.
                      </p>
                    </div>

                    <button
                      id="btn-pay-with-paypal"
                      type="button"
                      onClick={handleSubmitPayment}
                      className="w-full py-3 px-4 rounded-xl bg-[#ffc439] hover:bg-[#ffb71b] text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Pagar com PayPal ({displayPrice})</span>
                    </button>
                  </div>
                )}

                {/* --- METHOD 4: BOLETO --- */}
                {paymentMethod === 'boleto' && (
                  <div className="p-5 rounded-2xl bg-[#0a1022] border border-indigo-950 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Boleto Bancário Registrado</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">CPF do Pagador:</label>
                      <input
                        id="input-boleto-cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={14}
                        className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-indigo-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      * O boleto vence em 3 dias úteis. A liberação dos recursos ocorre automaticamente após a compensação bancária (1 a 2 dias úteis).
                    </p>

                    <button
                      id="btn-generate-boleto"
                      type="button"
                      onClick={handleSubmitPayment}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Gerar Boleto Bancário</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary & Perks (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-[#0c1224] border border-indigo-950 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Resumo do Pedido
                  </h4>

                  <div className="space-y-2.5 pb-3 border-b border-indigo-950 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{planName}</span>
                      <span className="font-bold text-white">{displayPrice}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Ciclo de Cobrança:</span>
                      <span className="capitalize">{billingCycle === 'monthly' ? 'Mensal' : 'Anual (-20% OFF)'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Impostos & Taxas:</span>
                      <span className="text-emerald-400">Inclusos</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1 text-sm font-extrabold text-white">
                    <span>Total a Pagar:</span>
                    <span className="text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {displayPrice}
                    </span>
                  </div>

                  {/* Included features pill */}
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Recursos desbloqueados imediatamente:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {isMedium ? (
                        <>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>150 imagens HD geradas por dia</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Velocidade 3x sem filas</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Todos os 6 estilos artísticos</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Análise ilimitada de documentos e fotos</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Imagens 4K & variações infinitas</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Raciocínio lógico e arquitetura avançada</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Personas personalizadas ilimitadas</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Suporte VIP 24/7 dedicado</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="p-4 rounded-xl bg-[#060a16] border border-indigo-950 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Garantia Incondicional de 7 dias</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Você pode cancelar ou alterar seu plano a qualquer momento diretamente no painel de configurações sem nenhum custo adicional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
