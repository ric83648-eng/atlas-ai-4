import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Download,
  Trash2,
  Maximize2,
  RefreshCw,
  Upload,
  X,
  ArrowRight,
  Layers,
  Globe,
  Crown,
  Zap,
  ExternalLink,
  ShieldCheck,
  Search,
  Camera,
  Package,
  CheckCircle2,
  Sliders,
  Check
} from 'lucide-react';
import { GeneratedImage, AspectRatioOption, ImageStylePreset, PlanTier, RealProductPhoto } from '../types';
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
  // Tabs: 'ai-studio' | 'real-archive' | 'product-staging'
  const [activeTab, setActiveTab] = useState<'ai-studio' | 'real-archive' | 'product-staging'>('ai-studio');

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('commercial-product');
  const [webSearchForImages, setWebSearchForImages] = useState(true);
  const [realBrandsMode, setRealBrandsMode] = useState(true);
  const [antiLookalikeMode, setAntiLookalikeMode] = useState(true);
  const [referenceImage, setReferenceImage] = useState<string | null>(initialReferenceImage || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real Product Archive Search State
  const [realSearchQuery, setRealSearchQuery] = useState('Coca-Cola');
  const [realSearchResults, setRealSearchResults] = useState<RealProductPhoto[]>([]);
  const [isSearchingReal, setIsSearchingReal] = useState(false);
  const [selectedRealPhoto, setSelectedRealPhoto] = useState<RealProductPhoto | null>(null);

  // Staging scene selection for user's own product
  const [selectedStagingScene, setSelectedStagingScene] = useState('white-studio');

  // Track expanded real photos on gallery items
  const [expandedRealPhotosId, setExpandedRealPhotosId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stagingFileInputRef = useRef<HTMLInputElement>(null);

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
      id: 'commercial-product',
      name: 'Marcas & Produto Real',
      description: 'Estúdio comercial de alta precisão anti-semelhança com lentes Hasselblad',
      previewGradient: 'from-emerald-500 via-teal-600 to-blue-700',
    },
    {
      id: 'automotive-real',
      name: 'Automotivo & Supercarros',
      description: 'Supercarros reais de produção, linhas aerodinâmicas e reflexos de showroom',
      previewGradient: 'from-red-600 via-rose-700 to-amber-700',
    },
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

  const brandPrompts = [
    { label: '🥤 Coca-Cola Original', prompt: 'Lata autêntica de Coca-Cola original gelada com gotas de condensação cristalinas sobre mesa de carvalho rústico, iluminação de estúdio comercial Hasselblad', style: 'commercial-product' },
    { label: '👟 Nike Air Jordan 1', prompt: 'Tênis autêntico Nike Air Jordan 1 Chicago em pedestal de vidro com iluminação de estúdio comercial e logo Swoosh nítido', style: 'commercial-product' },
    { label: '📱 iPhone 16 Pro Max', prompt: 'Apple iPhone 16 Pro Max oficial em Titânio Deserto sobre bancada de mármore com reflexos de iluminação suave', style: 'commercial-product' },
    { label: '🏎️ Ferrari SF90 Mônaco', prompt: 'Supercarro Ferrari SF90 Stradale vermelho Rosso Corsa oficial acelerando pela orla de Mônaco com reflexos de showroom', style: 'automotive-real' },
    { label: '⌚ Rolex Submariner', prompt: 'Relógio original Rolex Submariner Date em aço Oystersteel com mostrador preto e gotas de água sobre fundo de estúdio de luxo', style: 'commercial-product' },
    { label: '☕ Starbucks Iced', prompt: 'Copo oficial de café Starbucks gelado com calda de caramelo e logotipo da sereia verde nítido em balcão de madeira', style: 'commercial-product' },
    { label: '🎮 PlayStation 5', prompt: 'Console oficial Sony PlayStation 5 com iluminação LED azul suave e controle DualSense sobre bancada moderna', style: 'commercial-product' },
    { label: '🍔 McDonald\'s Big Mac', prompt: 'Sanduíche autêntico Big Mac do McDonald\'s com gergelim crocante, alface fresca e embalagem oficial clássica', style: 'commercial-product' },
    { label: '🥫 Guaraná Antarctica', prompt: 'Lata oficial gelada de refrigerante Guaraná Antarctica com gotas de água escorrendo e embalagem verde característica', style: 'commercial-product' },
    { label: '⚡ Tesla Cybertruck', prompt: 'Veículo Tesla Cybertruck de aço inoxidável sob iluminação urbana noturna em alta definição', style: 'automotive-real' },
  ];

  const stagingScenes = [
    {
      id: 'white-studio',
      name: 'Estúdio Branco Infinito',
      description: 'Fundo branco puro clássico de catálogo e-commerce com sombra suave',
      promptSuffix: 'resting in a clean commercial white infinity cyclorama studio backdrop with professional softbox key light and subtle contact shadow',
      previewColor: 'from-slate-200 to-slate-400 text-slate-900',
    },
    {
      id: 'dark-marble',
      name: 'Mármore Preto & Reflexos de Luxo',
      description: 'Superfície de mármore negro polido com reflexos espelhados de alta sofisticação',
      promptSuffix: 'resting on an ultra-polished black luxury marble surface with crisp specular reflections, dramatic dark mood lighting, rim highlights',
      previewColor: 'from-slate-800 to-zinc-950 text-slate-100',
    },
    {
      id: 'rustic-wood',
      name: 'Bancada de Carvalho Nobre',
      description: 'Mesa de madeira maciça com veios naturais e luz quente de janela matinal',
      promptSuffix: 'resting on a rich textured solid oak wooden countertop with warm natural morning window sunlight and soft architectural shadows',
      previewColor: 'from-amber-800 to-amber-950 text-amber-100',
    },
    {
      id: 'neon-pedestal',
      name: 'Pódio Futurista & Glow Comercial',
      description: 'Pedestal circular moderno com iluminação de halo suave e estética tech',
      promptSuffix: 'elevated on a sleek minimalist round commercial pedestal with subtle violet and cyan ambient glow, high-end tech catalog aesthetic',
      previewColor: 'from-indigo-700 to-purple-900 text-purple-100',
    },
    {
      id: 'lifestyle-cafe',
      name: 'Ambiente Lifestyle Urbano',
      description: 'Balcão de cafeteria moderna com iluminação natural e fundo suavemente desfocado',
      promptSuffix: 'resting on a contemporary cafe counter with blurred boutique interior background, shallow depth of field, natural ambient lighting',
      previewColor: 'from-stone-700 to-stone-900 text-stone-100',
    },
  ];

  const realSearchCategories = [
    { label: '🥤 Coca-Cola', query: 'Coca-Cola' },
    { label: '👟 Nike Sneakers', query: 'Nike sneaker' },
    { label: '📱 Apple iPhone', query: 'Apple iPhone' },
    { label: '🏎️ Ferrari', query: 'Ferrari' },
    { label: '⌚ Rolex', query: 'Rolex watch' },
    { label: '☕ Starbucks', query: 'Starbucks coffee' },
    { label: '🍔 McDonald\'s', query: 'McDonalds' },
    { label: '🎮 PlayStation', query: 'PlayStation' },
    { label: '🥫 Guaraná Antarctica', query: 'Guaraná Antarctica' },
    { label: '🍺 Heineken', query: 'Heineken' },
  ];

  // Fetch real photos from verified archives
  const searchRealArchive = async (queryStr: string) => {
    const q = queryStr.trim();
    if (!q) return;
    setIsSearchingReal(true);
    try {
      const res = await fetch(`/api/real-products?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setRealSearchResults(data.results || []);
    } catch (e) {
      console.error('Falha ao buscar fotos reais de produtos:', e);
    } finally {
      setIsSearchingReal(false);
    }
  };

  // Pre-load default real photos on mount or when opening real archive tab
  useEffect(() => {
    if (activeTab === 'real-archive' && realSearchResults.length === 0) {
      searchRealArchive(realSearchQuery || 'Coca-Cola');
    }
  }, [activeTab]);

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
          userMessage: `Aprimore este prompt para fotografia comercial profissional em alta resolução de produto real (sem cópias ou semelhantes). Retorne APENAS o prompt enriquecido em uma linha curta e direta, sem introduções: "${prompt}"`,
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
        ? '1/3 Pesquisando referências visuais do produto real na Web...'
        : '1/3 Otimizando parâmetros fotográficos comerciais...'
    );

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('2/3 Aplicando motor anti-semelhança com lentes Hasselblad...');
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('3/3 Finalizando texturas autênticas de fábrica em 8K...');
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
          realBrandsMode,
          antiLookalikeMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao gerar fotografia comercial.');
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
        realProductPhotos: data.realProductPhotos || [],
        createdAt: Date.now(),
      };

      onAddGeneratedImage(newImage);
      // Auto open modal for the new creation
      onOpenImageModal(data.imageUrl, prompt.trim());
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setErrorMessage(err.message || 'Ocorreu um erro ao gerar a fotografia comercial. Tente novamente.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Launch Staging generation from user's product photo
  const handleLaunchProductStaging = () => {
    if (!referenceImage) {
      stagingFileInputRef.current?.click();
      return;
    }

    const scene = stagingScenes.find((s) => s.id === selectedStagingScene) || stagingScenes[0];
    const stagingPrompt = `Fotografia comercial de alta precisão do produto exibido na imagem de referência, ${scene.promptSuffix}, iluminação de estúdio profissional, reflexos fiéis, nitidez 8K`;

    setPrompt(stagingPrompt);
    setSelectedStyle('commercial-product');
    setActiveTab('ai-studio');
  };

  return (
    <div id="image-studio-container" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Studio Header & Plan Limit Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motor de Fotos Reais de Produtos • Anti-Semelhança</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Estúdio de Fotos Reais com <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Atlas AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Crie fotos autênticas de produtos e marcas reais (sem imitações genéricas) ou explore o acervo verificado de fotos originais do mundo real.
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
                : `${usage.imagesCount}/${planLimits.dailyImages} fotos hoje`}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-[#070c17] rounded-2xl border border-indigo-950/90 shadow-md">
        <button
          id="tab-btn-ai-studio"
          type="button"
          onClick={() => setActiveTab('ai-studio')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ai-studio'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/60 border border-emerald-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Estúdio Comercial IA</span>
        </button>

        <button
          id="tab-btn-real-archive"
          type="button"
          onClick={() => setActiveTab('real-archive')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'real-archive'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-950/60 border border-blue-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Camera className="w-4 h-4 text-blue-300" />
          <span>Acervo de Fotos Reais (100% Câmera)</span>
        </button>

        <button
          id="tab-btn-product-staging"
          type="button"
          onClick={() => setActiveTab('product-staging')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'product-staging'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-950/60 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Package className="w-4 h-4 text-purple-300" />
          <span>Foto do Seu Produto Real</span>
        </button>
      </div>

      {/* TAB 1: AI COMMERCIAL STUDIO (WITH ANTI-LOOKALIKE ENGINE) */}
      {activeTab === 'ai-studio' && (
        <div id="studio-creation-card" className="p-5 sm:p-7 rounded-2xl bg-[#090e1a]/95 border border-indigo-950/90 shadow-2xl space-y-6">
          {/* Prompt Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="textarea-image-prompt" className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Descreva o Produto Real que Deseja Fotografar</span>
              </label>

              <button
                id="btn-enhance-prompt"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing || isGenerating}
                className="text-xs font-medium text-emerald-300 hover:text-emerald-200 flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Aprimorando...' : '✨ Aprimorar Estúdio'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="textarea-image-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Lata oficial de Coca-Cola original gelada com gotas de água / Tênis Nike Air Jordan 1 Chicago / Apple iPhone 16 Pro Max..."
                className="w-full p-4 rounded-xl bg-[#070c17] border border-indigo-900/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 leading-relaxed resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>
          </div>

          {/* Feature Switches: Anti-Lookalike Engine & Real Brands Fidelity & Web Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Anti-Lookalike Guard */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-[#070c17] to-teal-950/40 rounded-xl border border-emerald-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${antiLookalikeMode ? 'bg-emerald-600/30 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Anti-Semelhança</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      Zero Cópias
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Proíbe produtos genéricos, falsos ou "parecidos".
                  </p>
                </div>
              </div>

              <button
                id="toggle-anti-lookalike-mode"
                type="button"
                onClick={() => setAntiLookalikeMode(!antiLookalikeMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  antiLookalikeMode
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{antiLookalikeMode ? '✓ Ativo' : 'Desativado'}</span>
              </button>
            </div>

            {/* Real Brands & Real Objects Fidelity Switch */}
            <div className="p-3 bg-[#070c17] rounded-xl border border-indigo-950/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${realBrandsMode ? 'bg-teal-600/30 text-teal-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Logos & Embalagens OEM</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Garante cores oficiais e tipografia de fábrica.
                  </p>
                </div>
              </div>

              <button
                id="toggle-real-brands-mode"
                type="button"
                onClick={() => setRealBrandsMode(!realBrandsMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  realBrandsMode
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{realBrandsMode ? '✓ Ativo' : 'Desativado'}</span>
              </button>
            </div>

            {/* Web Search for Images Feature Switch */}
            <div className="p-3 bg-[#070c17] rounded-xl border border-indigo-950/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${webSearchForImages ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Pesquisa Web (Grounding)</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Recupera fotos e especificações reais da web.
                  </p>
                </div>
              </div>

              <button
                id="toggle-web-search-images"
                type="button"
                onClick={() => setWebSearchForImages(!webSearchForImages)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  webSearchForImages
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{webSearchForImages ? '✓ Ativa' : 'Desativada'}</span>
              </button>
            </div>
          </div>

          {/* Real Brands & Real Objects Inspiration Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>🏷️ Produtos e Marcas Reais (1 Clique):</span>
              </p>
              <span className="text-[10px] text-slate-400">Aplica especificações oficiais de fábrica</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {brandPrompts.map((b, idx) => (
                <button
                  key={idx}
                  id={`btn-brand-prompt-${idx}`}
                  onClick={() => {
                    setPrompt(b.prompt);
                    setSelectedStyle(b.style);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 hover:text-white border border-emerald-800/50 hover:border-emerald-500 text-xs font-medium transition-all cursor-pointer text-left shadow-sm"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Estilo Fotográfico</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {styles.map((style) => (
                <button
                  key={style.id}
                  id={`style-btn-${style.id}`}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                    selectedStyle === style.id
                      ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
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
                        ? 'bg-gradient-to-r from-emerald-600/90 to-teal-700/90 border-emerald-500 text-white shadow-md'
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
                Foto de Referência do Produto (Opcional)
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
                    <p className="font-semibold text-emerald-300">Foto Real Conectada</p>
                    <p className="text-[10px] text-slate-500">Usada como referência de identidade</p>
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
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070c17] border border-dashed border-indigo-900/80 hover:border-emerald-600/80 text-xs text-slate-400 hover:text-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Carregar foto real do seu produto</span>
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
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 shadow-emerald-950/50 disabled:opacity-50'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-200 shrink-0" />
                  <span className="truncate">{generationStep || 'O Atlas AI está produzindo sua fotografia comercial autêntica...'}</span>
                </>
              ) : !quota.allowed ? (
                <>
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>Limite diário do {currentPlan.toUpperCase()} atingido ({usage.imagesCount}/{planLimits.dailyImages}) — Fazer Upgrade</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span>Fotografar Produto com Atlas AI (Fidelidade Original)</span>
                  {currentPlan !== 'premium' && (
                    <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full text-emerald-200">
                      {usage.imagesCount + 1}/{planLimits.dailyImages}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED REAL PRODUCT PHOTOS ARCHIVE (100% REAL CAMERA PHOTOS) */}
      {activeTab === 'real-archive' && (
        <div id="real-archive-container" className="p-5 sm:p-7 rounded-2xl bg-[#090e1a]/95 border border-blue-950/80 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/40">
                <Camera className="w-3.5 h-3.5" />
                <span>Acervo de Fotos 100% Reais de Produtos (Zero IA / Zero Semelhantes)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fotografias de produtos reais capturadas com câmeras no mundo real por fotógrafos profissionais.
              </p>
            </div>
          </div>

          {/* Search bar for Real Products */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={realSearchQuery}
                onChange={(e) => setRealSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchRealArchive(realSearchQuery);
                  }
                }}
                placeholder="Pesquise qualquer produto real (ex: Coca-Cola, Nike, Apple iPhone, Rolex, Ferrari, Starbucks...)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070c17] border border-blue-900/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="btn-search-real-products"
              type="button"
              onClick={() => searchRealArchive(realSearchQuery)}
              disabled={isSearchingReal || !realSearchQuery.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSearchingReal ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Buscar Foto Real</span>
            </button>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2">
            {realSearchCategories.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRealSearchQuery(c.query);
                  searchRealArchive(c.query);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  realSearchQuery.toLowerCase().includes(c.query.toLowerCase())
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#070c17] text-slate-300 hover:text-white border border-blue-950/80 hover:border-blue-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          {isSearchingReal ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              <p className="text-sm text-slate-300">Buscando fotografias reais verificadas do produto...</p>
            </div>
          ) : realSearchResults.length === 0 ? (
            <div className="py-14 text-center rounded-xl bg-[#070c17] border border-blue-950/60">
              <Camera className="w-10 h-10 text-blue-950 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma fotografia encontrada para "{realSearchQuery}"</p>
              <p className="text-xs text-slate-500 mt-1">Tente pesquisar marcas globais como Coca-Cola, Nike, Apple, Ferrari ou Rolex.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {realSearchResults.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl bg-[#070c17] border border-blue-950/80 hover:border-blue-500/80 overflow-hidden shadow-lg transition-all flex flex-col justify-between"
                >
                  <div
                    className="relative aspect-square overflow-hidden bg-black/60 cursor-pointer"
                    onClick={() => onOpenImageModal(photo.fullUrl || photo.thumbUrl, photo.title)}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-blue-300 border border-blue-800/40">
                      Foto Real Original
                    </div>
                  </div>

                  <div className="p-3 bg-[#080d19] space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-2" title={photo.title}>
                        {photo.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{photo.author}</span>
                        <span className="text-emerald-400">{photo.license}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenImageModal(photo.fullUrl || photo.thumbUrl, photo.title)}
                        className="flex-1 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-[11px] text-blue-200 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Ver Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(`Fotografia comercial de alta precisão do produto ${photo.title}, iluminação de estúdio profissional, nitidez 8K`);
                          setSelectedStyle('commercial-product');
                          setReferenceImage(photo.fullUrl || photo.thumbUrl);
                          setActiveTab('ai-studio');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-[11px] text-emerald-200 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Usar como referência e criar cenário no estúdio"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>No Estúdio</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCT STAGING (USER'S OWN REAL PRODUCT UPLOAD) */}
      {activeTab === 'product-staging' && (
        <div id="product-staging-container" className="p-5 sm:p-7 rounded-2xl bg-[#090e1a]/95 border border-purple-950/80 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
              <Package className="w-3.5 h-3.5" />
              <span>Estúdio Comercial para o Seu Próprio Produto Real</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Envie a foto real do seu produto físico (artesanato, cosmético, bebida, embalagem) e posicione-o em cenários de estúdio comercial de alta conversão sem alterar seu design!
            </p>
          </div>

          <input
            type="file"
            ref={stagingFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />

          {/* Product Upload Box */}
          <div className="p-6 rounded-2xl bg-[#070c17] border-2 border-dashed border-purple-900/60 hover:border-purple-500/80 transition-all flex flex-col items-center justify-center text-center">
            {referenceImage ? (
              <div className="space-y-4 flex flex-col items-center">
                <img
                  src={referenceImage}
                  alt="Produto Real do Usuário"
                  className="max-h-52 max-w-full rounded-xl object-contain shadow-2xl bg-black/40 border border-purple-800/50"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => stagingFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Trocar Foto do Produto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceImage(null);
                      if (onClearInitialReference) onClearInitialReference();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 cursor-pointer py-4" onClick={() => stagingFileInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300 mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Faça upload da foto real do seu produto</p>
                  <p className="text-xs text-slate-400 mt-1">Formatos suportados: PNG, JPG, WEBP com ou sem fundo</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Selecionar Imagem do Computador
                </button>
              </div>
            )}
          </div>

          {/* Staging Scenes Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300">
              Escolha o Cenário Comercial do Estúdio:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stagingScenes.map((scene) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedStagingScene(scene.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    selectedStagingScene === scene.id
                      ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500/60 shadow-lg'
                      : 'border-indigo-950 bg-[#070c17] hover:border-indigo-800'
                  }`}
                >
                  <div className={`h-2 w-full rounded-full bg-gradient-to-r ${scene.previewColor} mb-2.5`} />
                  <div>
                    <p className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>{scene.name}</span>
                      {selectedStagingScene === scene.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{scene.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLaunchProductStaging}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Gerar Foto de Estúdio Profissional deste Produto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Gallery Section: Recent Creations */}
      <div id="image-gallery-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Galeria de Fotografias Comerciais</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold">
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
            <p className="text-sm font-medium text-slate-400">Nenhuma fotografia gerada ainda.</p>
            <p className="text-xs text-slate-600 mt-1">
              Escreva o nome de um produto real ou escolha uma sugestão acima para testar o motor anti-semelhança!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentImages.map((img) => (
              <div
                key={img.id}
                id={`gallery-item-${img.id}`}
                className="group relative rounded-xl overflow-hidden bg-[#090e1a] border border-indigo-950/80 shadow-lg hover:border-emerald-600/60 transition-all flex flex-col justify-between"
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
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/50 uppercase">
                        {img.style} • {img.aspectRatio}
                      </span>
                      <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prompt Info & Web Grounding Sources */}
                <div className="p-3 bg-[#080d19] space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {img.prompt}
                  </p>

                  {/* Real Product Photos matching this creation */}
                  {img.realProductPhotos && img.realProductPhotos.length > 0 && (
                    <div className="pt-2 border-t border-indigo-950/80">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRealPhotosId(
                            expandedRealPhotosId === img.id ? null : img.id
                          )
                        }
                        className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 p-1.5 rounded-lg border border-emerald-900/40 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>{img.realProductPhotos.length} Fotos Reais Originais</span>
                        </span>
                        <span className="text-[10px] underline">
                          {expandedRealPhotosId === img.id ? 'Ocultar' : 'Ver'}
                        </span>
                      </button>

                      {expandedRealPhotosId === img.id && (
                        <div className="grid grid-cols-3 gap-1.5 mt-2 p-1.5 rounded-lg bg-black/60">
                          {img.realProductPhotos.slice(0, 3).map((rp) => (
                            <img
                              key={rp.id}
                              src={rp.thumbUrl}
                              alt={rp.title}
                              title={rp.title}
                              className="aspect-square object-cover rounded cursor-pointer hover:opacity-90"
                              onClick={() => onOpenImageModal(rp.fullUrl || rp.thumbUrl, rp.title)}
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
