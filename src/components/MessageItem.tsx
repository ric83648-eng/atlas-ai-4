import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check, Volume2, VolumeX, Globe, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { ChatMessage } from '../types';
import { CodeBlock } from './CodeBlock';

interface MessageItemProps {
  message: ChatMessage;
  onOpenImageModal?: (imageUrl: string, prompt?: string) => void;
  onSendFollowUp?: (prompt: string) => void;
  language?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onOpenImageModal, onSendFollowUp, language = 'pt-BR' }) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols for speech
    const cleanText = message.content
      .replace(/[#*`_~\[\]()]/g, ' ')
      .replace(/https?:\/\/[^\s]+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language || 'pt-BR';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`msg-item-${message.id}`}
      className={`group flex gap-3.5 sm:gap-4 py-4 px-3 sm:px-5 rounded-2xl transition-all ${
        isAssistant
          ? 'bg-[#0f172a]/70 border border-indigo-950/70 shadow-lg shadow-black/20'
          : 'bg-[#1e1b4b]/30 border border-purple-900/30'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isAssistant ? (
          <div
            id={`avatar-atlas-${message.id}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-md shadow-indigo-500/20"
          >
            <div className="w-full h-full bg-[#090e1a] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        ) : (
          <div
            id={`avatar-user-${message.id}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-[1.5px]"
          >
            <div className="w-full h-full bg-[#0e1424] rounded-[10px] flex items-center justify-center">
              <User className="w-5 h-5 text-purple-300" />
            </div>
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold tracking-wide ${isAssistant ? 'text-indigo-300' : 'text-purple-300'}`}>
              {isAssistant ? 'Atlas AI' : 'Você'}
            </span>
            <span className="text-[11px] text-slate-500">{formattedTime}</span>
          </div>

          {/* Quick Actions (Copy, TTS) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAssistant && 'speechSynthesis' in window && (
              <button
                id={`btn-tts-${message.id}`}
                onClick={handleSpeak}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors cursor-pointer"
                title={isSpeaking ? 'Parar leitura' : 'Ouvir resposta'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              id={`btn-copy-${message.id}`}
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors cursor-pointer"
              title="Copiar mensagem"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Attached input image from user */}
        {message.image && (
          <div className="mb-3">
            <img
              src={message.image}
              alt="Imagem enviada pelo usuário"
              className="max-h-60 rounded-xl object-contain border border-purple-900/40 bg-black/40 cursor-pointer hover:opacity-95"
              referrerPolicy="no-referrer"
              onClick={() => onOpenImageModal && onOpenImageModal(message.image!)}
            />
          </div>
        )}

        {/* Text Content with Markdown */}
        <div className={`text-sm sm:text-base leading-relaxed ${message.isError ? 'text-rose-400' : 'prose-dark'}`}>
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                if (match || codeContent.includes('\n')) {
                  return <CodeBlock language={match ? match[1] : 'code'} value={codeContent} />;
                }
                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-200 border border-indigo-900/50 text-[13px] font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Generated Image inside AI response if present */}
        {message.generatedImageUrl && (
          <div className="mt-4 p-3 rounded-xl bg-[#090d18] border border-purple-900/40">
            <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Imagem gerada por Atlas AI</span>
            </div>
            <div className="relative group/img overflow-hidden rounded-lg">
              <img
                src={message.generatedImageUrl}
                alt="Imagem gerada"
                className="w-full max-h-96 object-contain rounded-lg bg-black/50 cursor-pointer hover:scale-[1.01] transition-transform duration-200"
                referrerPolicy="no-referrer"
                onClick={() => onOpenImageModal && onOpenImageModal(message.generatedImageUrl!, message.content)}
              />
            </div>
          </div>
        )}

        {/* Web Search Grounding Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-indigo-950/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Fontes consultadas na Web:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 text-xs text-slate-300 hover:text-indigo-200 border border-indigo-900/40 transition-colors"
                >
                  <span className="truncate max-w-[180px]">{src.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
