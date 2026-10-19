import React, { useState } from 'react';
import { X, Sliders, Check, RotateCcw, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { AVAILABLE_LANGUAGES } from '../utils/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  responseTone: string;
  onChangeResponseTone: (tone: string) => void;
  language: string;
  onSelectLanguage: (code: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSaveSystemPrompt,
  responseTone,
  onChangeResponseTone,
  language,
  onSelectLanguage,
}) => {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [localTone, setLocalTone] = useState(responseTone);
  const [localLang, setLocalLang] = useState(language);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const defaultPrompt = `Você é o Atlas AI, uma inteligência artificial avançada, prestativa, empática e altamente inteligente.
Suas respostas devem ser claras, bem formatadas em Markdown (com títulos, listas, negrito e blocos de código quando apropriado).
Você é capaz de responder dúvidas complexas, programar, redigir textos, resolver problemas lógicos, traduzir e orientar com precisão.`;

  const tones = [
    { id: 'balanced', label: 'Equilibrado & Completo', desc: 'Respostas ricas, bem estruturadas e naturais' },
    { id: 'concise', label: 'Conciso & Direto', desc: 'Respostas rápidas, objetivas e sem rodeios' },
    { id: 'technical', label: 'Técnico & Especialista', desc: 'Foco em código, arquitetura, precisão e matemática' },
    { id: 'creative', label: 'Criativo & Expansivo', desc: 'Brainstorming, redação criativa e ideias profundas' },
  ];

  const handleSave = () => {
    onSaveSystemPrompt(localPrompt);
    onChangeResponseTone(localTone);
    onSelectLanguage(localLang);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalPrompt(defaultPrompt);
    setLocalTone('balanced');
    setLocalLang('pt-BR');
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="max-w-lg w-full bg-[#0d1424] border border-indigo-900/70 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-950 bg-[#080d19]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-100">Configurações do Atlas AI</h3>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Language selection in settings */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Idioma Principal da IA</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  id={`settings-lang-${lang.code}`}
                  onClick={() => setLocalLang(lang.code)}
                  className={`p-2.5 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                    localLang === lang.code
                      ? 'bg-purple-950/70 border-purple-500 text-white shadow-md'
                      : 'bg-[#090f1d] border-indigo-950 text-slate-400 hover:border-indigo-800'
                  }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">{lang.nativeName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{lang.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Tom de Resposta
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  id={`tone-option-${t.id}`}
                  onClick={() => setLocalTone(t.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    localTone === t.id
                      ? 'bg-purple-950/60 border-purple-600 text-white shadow-md'
                      : 'bg-[#090f1d] border-indigo-950 text-slate-400 hover:border-indigo-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-200">{t.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt Customizer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Instruções de Personalidade (System Prompt)
              </label>
              <button
                id="btn-reset-system-prompt"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar padrão</span>
              </button>
            </div>
            <textarea
              id="textarea-custom-system-prompt"
              rows={4}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Defina como o Atlas AI deve se comportar..."
              className="w-full p-3 rounded-xl bg-[#090f1d] border border-indigo-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-600 font-mono leading-relaxed"
            />
          </div>

          {/* Info Badge */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              O Atlas AI utiliza o motor Gemini 3.7 Flash no servidor para geração em alta velocidade e modelos Imagen de ponta para imagens.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-950 bg-[#080d19] flex items-center justify-end gap-2.5">
          <button
            id="btn-cancel-settings"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-save-settings"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition-all cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            <span>{saved ? 'Salvo!' : 'Salvar Preferências'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
