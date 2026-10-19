import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  Globe,
  Image as ImageIcon,
  X,
  RefreshCw,
  Code2,
  BookOpen,
  PenTool,
  Cpu,
  ArrowDown
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';
import { getTranslation } from '../utils/languages';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (
    content: string,
    image?: string,
    webSearch?: boolean,
    isImageGenRequest?: boolean
  ) => void;
  onOpenImageModal: (imageUrl: string, prompt?: string) => void;
  onSwitchToImageStudio: (prompt?: string) => void;
  language: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onOpenImageModal,
  onSwitchToImageStudio,
  language,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isGeneratingImageMode, setIsGeneratingImageMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if ((!trimmed && !attachedImage) || isLoading) return;

    // Check if user requested image generation via prompt starting with /imagem or "gere uma imagem"
    const lower = trimmed.toLowerCase();
    const isImageIntent =
      isGeneratingImageMode ||
      lower.startsWith('/imagem') ||
      lower.startsWith('/image') ||
      lower.startsWith('gere uma imagem') ||
      lower.startsWith('crie uma imagem') ||
      lower.startsWith('gerar imagem') ||
      lower.startsWith('desenhe') ||
      lower.startsWith('generate image') ||
      lower.startsWith('draw') ||
      lower.startsWith('create image');

    let finalPrompt = trimmed;
    if (isImageIntent) {
      finalPrompt = trimmed.replace(
        /^(\/(imagem|image)|gere\s+uma\s+imagem\s+(de\s+|para\s+)?|crie\s+uma\s+imagem\s+(de\s+|para\s+)?|gerar\s+imagem\s+(de\s+|para\s+)?|desenhe\s+(um\s+|uma\s+)?|generate\s+image\s+(of\s+)?|create\s+image\s+(of\s+)?|draw\s+(a\s+|an\s+)?)\s*/i,
        ''
      ).trim() || trimmed;
    }

    onSendMessage(finalPrompt, attachedImage || undefined, webSearchEnabled, isImageIntent);

    setInputValue('');
    setAttachedImage(null);
    setIsGeneratingImageMode(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const starterCards = [
    {
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      title: language === 'pt-BR' ? 'Ciência & Tecnologia' : language === 'en-US' ? 'Science & Tech' : 'Tecnología',
      prompt: language === 'pt-BR'
        ? 'Explique como funcionam os computadores quânticos e suas vantagens sobre os clássicos.'
        : language === 'en-US'
        ? 'Explain how quantum computers work and their advantages over classical ones.'
        : 'Explica cómo funcionan las computadoras cuánticas y sus ventajas.',
    },
    {
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      title: language === 'pt-BR' ? 'Programação & Código' : language === 'en-US' ? 'Coding & Architecture' : 'Programación',
      prompt: language === 'pt-BR'
        ? 'Crie uma função eficiente em TypeScript para debounce com tipagem genérica.'
        : language === 'en-US'
        ? 'Write an efficient TypeScript generic debounce function with cancellation.'
        : 'Crea una función eficiente en TypeScript para debounce genérico.',
    },
    {
      icon: <ImageIcon className="w-5 h-5 text-purple-400" />,
      title: language === 'pt-BR' ? 'Geração de Imagens' : language === 'en-US' ? 'Image Generation' : 'Generación Visual',
      prompt: language === 'pt-BR'
        ? 'Gere uma imagem de uma cidade espacial futurista com auroras roxas e iluminação neon.'
        : language === 'en-US'
        ? 'A futuristic space city with purple auroras and cyberpunk neon lighting.'
        : 'Una ciudad espacial futurista con auroras púrpuras e iluminación de neón.',
      isImage: true,
    },
    {
      icon: <PenTool className="w-5 h-5 text-violet-400" />,
      title: language === 'pt-BR' ? 'Redação & Ideias' : language === 'en-US' ? 'Creative Writing' : 'Redacción Creativa',
      prompt: language === 'pt-BR'
        ? 'Escreva um ensaio reflexivo sobre o impacto da Inteligência Artificial na criatividade humana.'
        : language === 'en-US'
        ? 'Write a thoughtful essay on how AI is reshaping human artistic creativity.'
        : 'Escribe un ensayo sobre el impacto de la Inteligencia Artificial en el arte.',
    },
  ];

  return (
    <div id="chat-view-container" className="flex-1 flex flex-col h-full overflow-hidden bg-[#070b14]">
      {/* Messages Scroll Area */}
      <div id="messages-container" className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 text-center space-y-8 animate-in fade-in duration-300">
            {/* Glowing Orb Hero */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-xl opacity-35 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-2xl">
                <div className="w-full h-full bg-[#090e1a] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {getTranslation(language, 'starterGreeting')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                {getTranslation(language, 'starterSub')}
              </p>
            </div>

            {/* Quick Starters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-2">
              {starterCards.map((card, idx) => (
                <button
                  key={idx}
                  id={`starter-card-${idx}`}
                  onClick={() => {
                    if (card.isImage) {
                      onSendMessage(card.prompt, undefined, false, true);
                    } else {
                      onSendMessage(card.prompt);
                    }
                  }}
                  className="p-4 rounded-xl bg-[#0c1222]/80 hover:bg-[#111a33] border border-indigo-950/80 hover:border-purple-600/50 shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-2 rounded-lg bg-indigo-950/60 group-hover:bg-purple-950/60 transition-colors">
                      {card.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {card.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onOpenImageModal={onOpenImageModal}
                onSendFollowUp={(p) => onSendMessage(p)}
                language={language}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                id="atlas-loading-indicator"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#0f172a]/60 border border-indigo-950/80 max-w-fit shadow-lg animate-pulse"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-[#090e1a] rounded-[11px] flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-300">
                    {getTranslation(language, 'thinking')}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar Area */}
      <div id="chat-input-area" className="p-3 sm:p-5 border-t border-indigo-950/80 bg-[#080d1a]/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Image Attachment Preview */}
          {attachedImage && (
            <div className="relative inline-flex items-center gap-2 p-2 rounded-xl bg-[#0f172a] border border-purple-900/60 mb-1">
              <img
                src={attachedImage}
                alt="Imagem anexada"
                className="w-12 h-12 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs text-slate-300 pr-6">
                <p className="font-semibold text-purple-300">Imagem anexada</p>
                <p className="text-[10px] text-slate-400">Atlas AI irá analisar esta imagem</p>
              </div>
              <button
                id="btn-remove-chat-attachment"
                onClick={() => setAttachedImage(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-950/80 text-rose-300 hover:bg-rose-900 transition-colors cursor-pointer"
                title="Remover anexo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Mode tag if image generation mode is toggled */}
          {isGeneratingImageMode && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{getTranslation(language, 'generateImageModeText')}</span>
              </div>
              <button
                id="btn-cancel-image-mode"
                onClick={() => setIsGeneratingImageMode(false)}
                className="p-0.5 rounded text-purple-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Input Box */}
          <div className="relative flex items-end gap-2 bg-[#0c1222] border border-indigo-900/60 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40 rounded-2xl p-2.5 shadow-xl transition-all">
            {/* Left Options (Attach image, Web Search, Generate Image mode) */}
            <div className="flex items-center gap-1 self-end pb-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />
              <button
                id="btn-attach-image"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  attachedImage
                    ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                    : 'text-slate-400 hover:text-indigo-200 hover:bg-indigo-950/50'
                }`}
                title="Anexar imagem para análise"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                id="btn-toggle-web-search"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  webSearchEnabled
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/50'
                }`}
                title="Buscar informações atualizadas na web"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{getTranslation(language, 'web')}</span>
              </button>

              <button
                id="btn-toggle-image-mode"
                onClick={() => setIsGeneratingImageMode(!isGeneratingImageMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isGeneratingImageMode
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-indigo-950/50'
                }`}
                title="Gerar imagem diretamente no chat"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{getTranslation(language, 'generateImg')}</span>
              </button>
            </div>

            {/* Text Input */}
            <textarea
              id="textarea-chat-input"
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isGeneratingImageMode
                  ? getTranslation(language, 'imagePlaceholder')
                  : getTranslation(language, 'inputPlaceholder')
              }
              className="flex-1 max-h-40 min-h-[38px] bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed"
            />

            {/* Send Button */}
            <button
              id="btn-send-chat-message"
              onClick={handleSend}
              disabled={(!inputValue.trim() && !attachedImage) || isLoading}
              className="self-end p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-950/30 transition-all cursor-pointer"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>{getTranslation(language, 'shiftEnter')}</span>
            <span>Atlas AI v3.7 • Gemini & Imagen Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
