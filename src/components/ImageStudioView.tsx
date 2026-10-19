import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, Trash2, Maximize2, RefreshCw, Upload, X, ArrowRight, Layers, Globe, Crown, Zap, ExternalLink } from 'lucide-react';
import { GeneratedImage, AspectRatioOption, ImageStylePreset, PlanTier } from '../types';
import { checkCanGenerateImage, getDailyUsage, incrementImageUsage, PLAN_LIMITS } from '../utils/planLimits';

interface ImageStudioViewProps {
  onOpenImageModal: (imageUrl: string, prompt?: string) => void;
  recentImages: GeneratedImage[];
  onAddGeneratedImage: (img: GeneratedImage) => void;
  onClearRecentImages: () => void;
  onDeleteImage: (id: string) => void;
  initialReferenceImage?: string | null;
  onClearInitialReference?: () => void;
  currentPlan: PlanTier;
  onOpenPlans: () => void;
  onHitLimit: (type: 'images' | 'messages', count: number) => void;
  onUsageUpdated?: () => void;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({
  onOpenImageModal,
  recentImages,
  onAddGeneratedImage,
  onClearRecentImages,
  onDeleteImage,
  initialReferenceImage,
  onClearInitialReference,
  currentPlan,
  onOpenPlans,
  onHitLimit,
  onUsageUpdated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [webSearchForImages, setWebSearchForImages] = useState(true);
  const [referenceImage, setReferenceImage] = useState<string | null>(initialReferenceImage || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quota = checkCanGenerateImage(currentPlan);
  const usage = getDailyUsage();
  const planLimits = PLAN_LIMITS[currentPlan];

  const aspectRatios: AspectRatioOption[] = [
    { id: '1:1', label: '1:1', ratio: 'Quadrado', iconWidth: 16, iconHeight: 16 },
    { id: '16:9', label: '16:9', ratio: 'Widescreen', iconWidth: 20, iconHeight: 12 },
    { id: '9:16', label: '9:16', ratio: 'Vertical/Story', iconWidth: 12, iconHeight: 20 },
    { id: '4:3', label: '4:3', ratio: 'Foto Padrão', iconWidth: 18, iconHeight: 14 },
    { id: '3:4', label: '3:4', ratio: 'Retrato', iconWidth: 14, iconHeight: 18 },
  ];

  const styles: ImageStylePreset[] = [
    {
      id: 'realistic',
      name: 'Fotografia Realista',
      description: 'Foto real autêntica 8k, iluminação natural e texturas nítidas',
      previewGradient: 'from-amber-700 via-orange-800 to-stone-900',
    },
    {
      id: 'cinematic',
      name: 'Cinematográfico',
      description: 'Iluminação de cinema 8k ultra detalhada e dramática',
      previewGradient: 'from-slate-700 via-indigo-950 to-blue-900',
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk & Neon',
      description: 'Iluminação neon, tons azul escuro e roxo futurista',
      previewGradient: 'from-blue-600 via-indigo-700 to-purple-800',
    },
    {
      id: 'anime',
      name: 'Anime & Mangá',
      description: 'Estilo de animação japonesa vibrante Makoto Shinkai',
      previewGradient: 'from-pink-600 via-purple-700 to-indigo-800',
    },
    {
      id: 'fantasy',
      name: 'Fantasia Épica',
      description: 'Arte mágica de fantasia, reinos e auras radiantes',
      previewGradient: 'from-purple-600 via-violet-800 to-amber-700',
    },
    {
      id: '3d-render',
      name: 'Render 3D',
      description: 'Modelagem 3D limpa estilo Unreal Engine & Pixar',
      previewGradient: 'from-cyan-600 via-blue-700 to-purple-800',
    },
    {
      id: 'minimalist',
      name: 'Minimalista',
      description: 'Linhas vetoriais limpas, cores suaves e elegância',
      previewGradient: 'from-slate-800 via-slate-700 to-indigo-900',
    },
  ];

  const samplePrompts = [
    'Foto realista de um leão majestoso em repouso ao pôr do sol na savana',
    'Retrato em close-up de um café expresso cremoso com fumaça subindo em mesa rústica de madeira',
    'Carro esportivo preto fosco molhado pela chuva em uma avenida moderna à noite',
    'Cidade futurista com arranha-céus iluminados sob auroras boreais',
    'Astronauta olhando a Terra flutuando no espaço sideral com reflexo no visor do capacete',
  ];

  // Handle reference image upload
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Enhance prompt with AI
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Aprimore este prompt para geração de imagem com detalhes visuais impressionantes (iluminação, composição, atmosfera, texturas). Retorne APENAS o prompt enriquecido em uma linha curta e direta, sem introduções: "${prompt}"`,
          webSearch: webSearchForImages,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setPrompt(data.text.replace(/^["']|["']$/g, '').trim());
      }
    } catch (e) {
      console.error('Erro ao aprimorar prompt:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate image
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check plan quota limits
    const currentQuota = checkCanGenerateImage(currentPlan);
    if (!currentQuota.allowed) {
      onHitLimit('images', usage.imagesCount);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    setGenerationStep(
      webSearchForImages
        ? '1/3 Pesquisando referências visuais reais na Web...'
        : '1/3 Otimizando composição e iluminação...'
    );

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('2/3 Renderizando imagem com difusão neural...');
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('3/3 Finalizando texturas e iluminação em alta resolução...');
    }, 6000);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style: selectedStyle,
          referenceImage: referenceImage || undefined,
          webSearch: webSearchForImages,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao gerar imagem.');
      }

      // Increment daily image counter
      incrementImageUsage();
      if (onUsageUpdated) onUsageUpdated();

      const newImage: GeneratedImage = {
        id: 'img-' + Date.now(),
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
        enhancedPrompt: data.enhancedPrompt,
        aspectRatio: data.aspectRatio || aspectRatio,
        style: selectedStyle,
        sources: data.sources || [],
        createdAt: Date.now(),
      };

      onAddGeneratedImage(newImage);
      // Auto open modal for the new creation
      onOpenImageModal(data.imageUrl, prompt.trim());
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setErrorMessage(err.message || 'Ocorreu um erro ao gerar a imagem. Tente novamente.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div id="image-studio-container" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Studio Header & Plan Limit Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Motor de Criação Visual Atlas & Pesquisa Web</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Crie Imagens com <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Atlas AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Geração de imagens reais inéditas com pesquisa na web em tempo real para máxima precisão fotográfica.
          </p>
        </div>

        {/* Plan Quota Card */}
        <div
          onClick={onOpenPlans}
          className="flex items-center gap-3 p-3 bg-[#0c1224] hover:bg-[#0f1730] border border-indigo-900/60 hover:border-purple-600/60 rounded-2xl cursor-pointer transition-all shadow-md shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-300">
            {currentPlan === 'premium' ? <Crown className="w-5 h-5 text-amber-400" /> : <Zap className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white uppercase">{currentPlan}</span>
              <span className="text-[10px] text-purple-300 font-semibold underline">Alterar</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentPlan === 'premium'
                ? '∞ Imagens Ilimitadas'
                : `${usage.imagesCount}/${planLimits.dailyImages} imagens hoje`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Generation Studio Card */}
      <div
        id="image-generation-form-card"
        className="bg-[#0b1122]/90 border border-indigo-950/80 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-purple-950/20 space-y-6"
      >
        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Descrição da Imagem (Prompt)</span>
            </label>
            <button
              id="btn-enhance-prompt"
              onClick={handleEnhancePrompt}
              disabled={!prompt.trim() || isEnhancing || isGenerating}
              className="text-xs font-medium text-indigo-300 hover:text-purple-300 flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Aprimorando...' : '✨ Aprimorar com IA'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="textarea-image-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva detalhadamente a cena que deseja criar... (Ex: Um leão majestoso em repouso ao pôr do sol na savana, foto 8k realista)"
              className="w-full p-4 rounded-xl bg-[#070c17] border border-indigo-900/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 leading-relaxed resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>
        </div>

        {/* Web Search for Images Feature Switch */}
        <div className="p-3 bg-[#070c17] rounded-xl border border-indigo-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${webSearchForImages ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Pesquisa Web para Imagens</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                  Google Search Grounding
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                A IA consulta fatos e detalhes visuais reais na web para renderizar o sujeito com exatidão fotográfica.
              </p>
            </div>
          </div>

          <button
            id="toggle-web-search-images"
            type="button"
            onClick={() => setWebSearchForImages(!webSearchForImages)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              webSearchForImages
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{webSearchForImages ? '✓ Pesquisa Ativa' : 'Desativada'}</span>
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Sugestões Rápidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                id={`btn-sample-prompt-${idx}`}
                onClick={() => setPrompt(s)}
                className="px-3 py-1.5 rounded-lg bg-[#070c17] hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-indigo-950 hover:border-indigo-800 text-xs transition-colors cursor-pointer text-left truncate max-w-xs sm:max-w-md"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Style Presets Grid */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Estilo Visual</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {styles.map((style) => (
              <button
                key={style.id}
                id={`style-btn-${style.id}`}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                  selectedStyle === style.id
                    ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/40'
                    : 'border-indigo-950 bg-[#070c17] hover:border-indigo-800/80'
                }`}
              >
                <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${style.previewGradient} mb-2`} />
                <div>
                  <p className="text-xs font-bold text-slate-200">{style.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{style.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Reference Image Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Proporção (Aspect Ratio)
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((item) => (
                <button
                  key={item.id}
                  id={`ratio-btn-${item.id}`}
                  onClick={() => setAspectRatio(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    aspectRatio === item.id
                      ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 border-purple-500 text-white shadow-md'
                      : 'bg-[#070c17] border-indigo-950 text-slate-400 hover:text-slate-200 hover:border-indigo-800'
                  }`}
                >
                  <div
                    className="border border-current rounded-[2px]"
                    style={{ width: `${item.iconWidth}px`, height: `${item.iconHeight}px` }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference Image Uploader (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Imagem de Referência (Opcional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />

            {referenceImage ? (
              <div className="relative inline-flex items-center gap-3 p-2 rounded-xl bg-[#070c17] border border-purple-900/60">
                <img
                  src={referenceImage}
                  alt="Referência"
                  className="w-12 h-12 object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs text-slate-300 pr-6">
                  <p className="font-semibold text-purple-300">Referência ativa</p>
                  <p className="text-[10px] text-slate-500">Usada para guiar a criação</p>
                </div>
                <button
                  id="btn-remove-reference-img"
                  onClick={() => {
                    setReferenceImage(null);
                    if (onClearInitialReference) onClearInitialReference();
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-950/80 text-rose-300 hover:bg-rose-900 transition-colors"
                  title="Remover referência"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-upload-ref-img"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#070c17] border border-dashed border-indigo-900/80 hover:border-purple-600/80 text-xs text-slate-400 hover:text-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Carregar foto de referência</span>
              </button>
            )}
          </div>
        </div>

        {/* Error banner if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900/60 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Action Button: Generate Image */}
        <div className="pt-2">
          <button
            id="btn-trigger-image-generate"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !quota.allowed
                ? 'bg-amber-800/80 hover:bg-amber-700 shadow-amber-950/40'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-purple-950/40 disabled:opacity-50'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-purple-300 shrink-0" />
                <span className="truncate">{generationStep || 'O Atlas AI está pintando sua obra de arte...'}</span>
              </>
            ) : !quota.allowed ? (
              <>
                <Zap className="w-5 h-5 text-amber-300" />
                <span>Limite diário do {currentPlan.toUpperCase()} atingido ({usage.imagesCount}/{planLimits.dailyImages}) — Fazer Upgrade</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span>Gerar Imagem com Atlas AI</span>
                {currentPlan !== 'premium' && (
                  <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full text-purple-200">
                    {usage.imagesCount + 1}/{planLimits.dailyImages}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Section: Recent Creations */}
      <div id="image-gallery-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Galeria de Criações Recentes</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold">
              {recentImages.length}
            </span>
          </div>
          {recentImages.length > 0 && (
            <button
              id="btn-clear-gallery"
              onClick={onClearRecentImages}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Galeria</span>
            </button>
          )}
        </div>

        {recentImages.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#090e1a]/60 border border-indigo-950/60">
            <ImageIcon className="w-10 h-10 mx-auto text-indigo-950 mb-3" />
            <p className="text-sm font-medium text-slate-400">Nenhuma imagem gerada ainda.</p>
            <p className="text-xs text-slate-600 mt-1">
              Escreva um prompt acima e veja o poder do Atlas AI com pesquisa na web em ação!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentImages.map((img) => (
              <div
                key={img.id}
                id={`gallery-item-${img.id}`}
                className="group relative rounded-xl overflow-hidden bg-[#090e1a] border border-indigo-950/80 shadow-lg hover:border-purple-600/60 transition-all"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-square overflow-hidden bg-black/40 cursor-pointer"
                  onClick={() => onOpenImageModal(img.imageUrl, img.prompt)}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        id={`btn-delete-img-${img.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteImage(img.id);
                        }}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-950 text-slate-300 hover:text-rose-300 backdrop-blur-sm transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 uppercase">
                        {img.style} • {img.aspectRatio}
                      </span>
                      <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prompt Info & Web Grounding Sources */}
                <div className="p-3 bg-[#080d19] space-y-1.5">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {img.prompt}
                  </p>
                  {img.sources && img.sources.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400">
                      <Globe className="w-3 h-3" />
                      <span>{img.sources.length} referências web pesquisadas</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
