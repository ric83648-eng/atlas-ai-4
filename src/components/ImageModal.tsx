import React, { useState } from 'react';
import { X, Download, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  prompt?: string;
  onClose: () => void;
  onUseAsReference?: (imageUrl: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  prompt,
  onClose,
  onUseAsReference,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!imageUrl) return null;

  const handleDownload = () => {
    setDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `atlas-ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Falha ao baixar imagem:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar prompt:', err);
    }
  };

  return (
    <div
      id="image-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="image-modal-card"
        className="relative max-w-4xl w-full bg-[#0c1220] border border-indigo-900/60 rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/40 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-950 bg-[#080d17]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Visualizador de Imagem • Atlas AI</h3>
          </div>
          <button
            id="btn-close-image-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Image */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#050810]/90">
          <img
            src={imageUrl}
            alt={prompt || 'Imagem gerada pelo Atlas AI'}
            className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-indigo-950/80"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Footer Actions & Prompt Info */}
        <div className="p-4 sm:p-5 border-t border-indigo-950 bg-[#090e1a] flex flex-col gap-3">
          {prompt && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40 flex items-start justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                <span className="font-semibold text-purple-300">Prompt: </span>
                {prompt}
              </p>
              <button
                id="btn-copy-modal-prompt"
                onClick={handleCopyPrompt}
                className="shrink-0 p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/80 text-indigo-300 text-xs flex items-center gap-1 transition-colors"
                title="Copiar prompt"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            {onUseAsReference && (
              <button
                id="btn-use-as-ref"
                onClick={() => {
                  onUseAsReference(imageUrl);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-xs sm:text-sm font-medium text-purple-200 border border-purple-800/40 transition-colors cursor-pointer"
              >
                Usar como Referência
              </button>
            )}

            <button
              id="btn-download-image"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Baixando...' : 'Baixar Imagem HD'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
