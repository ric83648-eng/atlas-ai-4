import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div id={`code-block-${language}`} className="relative my-3 rounded-lg overflow-hidden border border-indigo-900/50 bg-[#090d16]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e1424] border-b border-indigo-900/40 text-xs font-mono text-indigo-300">
        <span className="uppercase font-semibold tracking-wider text-purple-300">{language}</span>
        <button
          id={`btn-copy-code-${language}`}
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white transition-colors cursor-pointer"
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
        <pre className="m-0">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
