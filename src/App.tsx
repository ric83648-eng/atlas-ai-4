import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ImageStudioView } from './components/ImageStudioView';
import { ImageModal } from './components/ImageModal';
import { SettingsModal } from './components/SettingsModal';
import { PlansModal } from './components/PlansModal';
import { PlanLimitModal } from './components/PlanLimitModal';
import { AppMode, ChatMessage, ChatSession, GeneratedImage, PlanTier } from './types';
import {
  checkCanGenerateImage,
  checkCanSendMessage,
  incrementImageUsage,
  incrementMessageUsage,
  getDailyUsage,
} from './utils/planLimits';

const SESSIONS_STORAGE_KEY = 'atlas_ai_sessions_v2';
const IMAGES_STORAGE_KEY = 'atlas_ai_images_v2';
const SETTINGS_STORAGE_KEY = 'atlas_ai_settings_v2';
const LANGUAGE_STORAGE_KEY = 'atlas_ai_language_v2';
const PLAN_STORAGE_KEY = 'atlas_ai_plan_v2';

export default function App() {
  // Navigation mode
  const [currentMode, setCurrentMode] = useState<AppMode>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Language state
  const [language, setLanguage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'pt-BR';
  });

  // Plans state (Base, Medium, Premium)
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved === 'base' || saved === 'medium' || saved === 'premium') {
        return saved;
      }
    } catch (e) {}
    return 'base';
  });
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalData, setLimitModalData] = useState<{
    type: 'images' | 'messages';
    count: number;
  }>({ type: 'images', count: 0 });
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.systemPrompt || '';
      }
    } catch (e) {}
    return `Você é o Atlas AI, uma inteligência artificial avançada, prestativa, empática e altamente inteligente.
Suas respostas devem ser claras, bem formatadas em Markdown (com títulos, listas, negrito e blocos de código quando apropriado).
Você é capaz de responder dúvidas complexas, programar, redigir textos, resolver problemas lógicos, traduzir e orientar com precisão.`;
  });
  const [responseTone, setResponseTone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.responseTone || 'balanced';
      }
    } catch (e) {}
    return 'balanced';
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao carregar sessões:', e);
    }
    const defaultSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Nova Conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [defaultSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-' + Date.now();
  });

  // Images gallery state
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Erro ao carregar galeria:', e);
    }
    return [];
  });

  // Modal inspection
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [activeModalPrompt, setActiveModalPrompt] = useState<string | undefined>(undefined);
  const [referenceForStudio, setReferenceForStudio] = useState<string | null>(null);

  // Chat loading state
  const [isLoading, setIsLoading] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Falha ao salvar sessões:', e);
    }
  }, [sessions]);

  // Sync images to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(recentImages));
    } catch (e) {
      console.error('Falha ao salvar imagens:', e);
    }
  }, [recentImages]);

  // Sync language to localStorage
  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (e) {}
  };

  // Sync plan to localStorage
  const handleSelectPlan = (plan: PlanTier) => {
    setCurrentPlan(plan);
    setUsageRefreshKey((k) => k + 1);
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, plan);
    } catch (e) {}
  };

  // Trigger Plan Limit modal
  const handleTriggerLimitModal = (type: 'images' | 'messages', count: number) => {
    setLimitModalData({ type, count });
    setLimitModalOpen(true);
  };

  // Sync settings
  const handleSaveSystemPrompt = (prompt: string) => {
    setSystemPrompt(prompt);
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ systemPrompt: prompt, responseTone })
    );
  };

  const handleChangeResponseTone = (tone: string) => {
    setResponseTone(tone);
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ systemPrompt, responseTone: tone })
    );
  };

  // Get active session
  const activeSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0] || {
      id: 'session-' + Date.now(),
      title: 'Nova Conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

  // Create new session
  const handleNewSession = () => {
    const newSess: ChatSession = {
      id: 'session-' + Date.now(),
      title: language === 'en-US' ? 'New Chat' : language === 'es-ES' ? 'Nueva Conversación' : 'Nova Conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSess, ...prev]);
    setCurrentSessionId(newSess.id);
    setCurrentMode('chat');
  };

  // Delete session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: language === 'en-US' ? 'New Chat' : 'Nova Conversa',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    const fresh: ChatSession = {
      id: 'session-' + Date.now(),
      title: language === 'en-US' ? 'New Chat' : 'Nova Conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
  };

  // Handle Send Chat message
  const handleSendMessage = async (
    content: string,
    image?: string,
    webSearch: boolean = false,
    isImageGenRequest: boolean = false
  ) => {
    if (!content.trim() && !image) return;

    // Check Plan Limits before making requests
    if (isImageGenRequest) {
      const imageQuota = checkCanGenerateImage(currentPlan);
      if (!imageQuota.allowed) {
        const currentUsage = getDailyUsage();
        handleTriggerLimitModal('images', currentUsage.imagesCount);
        return;
      }
    } else {
      const msgQuota = checkCanSendMessage(currentPlan);
      if (!msgQuota.allowed) {
        const currentUsage = getDailyUsage();
        handleTriggerLimitModal('messages', currentUsage.messagesCount);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: content.trim(),
      image,
      timestamp: Date.now(),
    };

    // Update active session messages
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const isFirstMessage = s.messages.length === 0;
          const newTitle = isFirstMessage
            ? content.slice(0, 30) || 'Conversa com Imagem'
            : s.title;

          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      if (isImageGenRequest) {
        // Detect requested style from prompt text
        let detectedStyle = 'commercial-product';
        const lowerPrompt = content.toLowerCase();
        if (
          lowerPrompt.includes('ferrari') ||
          lowerPrompt.includes('porsche') ||
          lowerPrompt.includes('lamborghini') ||
          lowerPrompt.includes('tesla') ||
          lowerPrompt.includes('cybertruck') ||
          lowerPrompt.includes('supercarro') ||
          lowerPrompt.includes('carro esportivo') ||
          lowerPrompt.includes('bmw') ||
          lowerPrompt.includes('mercedes') ||
          lowerPrompt.includes('audi')
        ) {
          detectedStyle = 'automotive-real';
        } else if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('desenho')) {
          detectedStyle = 'anime';
        } else if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('neon') || lowerPrompt.includes('futurista')) {
          detectedStyle = 'cyberpunk';
        } else if (lowerPrompt.includes('fantasia') || lowerPrompt.includes('mágico') || lowerPrompt.includes('dragão')) {
          detectedStyle = 'fantasy';
        } else if (lowerPrompt.includes('3d') || lowerPrompt.includes('pixar') || lowerPrompt.includes('render')) {
          detectedStyle = '3d-render';
        } else if (lowerPrompt.includes('minimalista') || lowerPrompt.includes('vetor')) {
          detectedStyle = 'minimalist';
        } else if (lowerPrompt.includes('cinema') || lowerPrompt.includes('cinematográfico')) {
          detectedStyle = 'cinematic';
        } else if (
          lowerPrompt.includes('natureza') ||
          lowerPrompt.includes('paisagem') ||
          lowerPrompt.includes('animal') ||
          lowerPrompt.includes('leão') ||
          lowerPrompt.includes('floresta')
        ) {
          detectedStyle = 'realistic';
        }

        // Direct Image Generation request from chat with real brands and anti-lookalike fidelity
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: content,
            aspectRatio: '1:1',
            style: detectedStyle,
            referenceImage: image,
            webSearch: true,
            realBrandsMode: true,
            antiLookalikeMode: true,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Falha ao gerar imagem.');
        }

        // Count image usage
        incrementImageUsage();
        setUsageRefreshKey((k) => k + 1);

        const newImageObj: GeneratedImage = {
          id: 'img-' + Date.now(),
          imageUrl: data.imageUrl,
          prompt: content,
          enhancedPrompt: data.enhancedPrompt,
          aspectRatio: data.aspectRatio || '1:1',
          style: detectedStyle,
          sources: data.sources || [],
          realProductPhotos: data.realProductPhotos || [],
          createdAt: Date.now(),
        };

        setRecentImages((prev) => [newImageObj, ...prev]);

        const assistantMessage: ChatMessage = {
          id: 'msg-asst-' + Date.now(),
          role: 'assistant',
          content: `Aqui está a fotografia comercial autêntica gerada para: **"${content}"**`,
          timestamp: Date.now(),
          generatedImageUrl: data.imageUrl,
          realProductPhotos: data.realProductPhotos,
          sources: data.sources,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMessage] }
              : s
          )
        );
      } else {
        // Normal text / Q&A chat
        let toneModifier = '';
        if (responseTone === 'concise') {
          toneModifier = '\nSeja ultra conciso e direto ao ponto.';
        } else if (responseTone === 'technical') {
          toneModifier = '\nAdote uma abordagem altamente técnica, detalhando arquitetura e blocos de código.';
        } else if (responseTone === 'creative') {
          toneModifier = '\nSeja inspirador, criativo e explore conexões inovadoras.';
        }

        const effectiveSystem = systemPrompt + toneModifier;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: content,
            messages: activeSession.messages.slice(-8), // Send last 8 context turns
            systemPrompt: effectiveSystem,
            webSearch,
            attachedImage: image,
            language, // Pass selected language
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Erro na resposta do Atlas AI.');
        }

        // Count message usage
        incrementMessageUsage();
        setUsageRefreshKey((k) => k + 1);

        const assistantMessage: ChatMessage = {
          id: 'msg-asst-' + Date.now(),
          role: 'assistant',
          content: data.text,
          sources: data.sources,
          realProductPhotos: data.realProductPhotos,
          timestamp: Date.now(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMessage] }
              : s
          )
        );
      }
    } catch (err: any) {
      console.error('Erro na resposta:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Ops!** ${err.message || 'Não consegui processar a resposta no momento. Por favor, tente novamente.'}`,
        timestamp: Date.now(),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Image Studio actions
  const handleAddGeneratedImage = (img: GeneratedImage) => {
    setRecentImages((prev) => [img, ...prev]);
  };

  const handleClearRecentImages = () => {
    setRecentImages([]);
  };

  const handleDeleteImage = (id: string) => {
    setRecentImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUseAsReference = (imageUrl: string) => {
    setReferenceForStudio(imageUrl);
    setCurrentMode('image-studio');
  };

  return (
    <div id="atlas-app-root" className="flex flex-col h-screen w-screen bg-[#070b14] text-slate-100 antialiased overflow-hidden select-text">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewSession}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPlans={() => setPlansModalOpen(true)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        currentPlan={currentPlan}
      />

      {/* Main Workspace with Sidebar & Active View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => setCurrentSessionId(id)}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onClearAllSessions={handleClearAllSessions}
          onOpenPlans={() => setPlansModalOpen(true)}
          currentPlan={currentPlan}
          language={language}
          refreshUsageKey={usageRefreshKey}
        />

        {/* Dynamic Center View (Chat vs Image Studio) */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#070a13]">
          {currentMode === 'chat' ? (
            <ChatView
              messages={activeSession.messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onOpenImageModal={(url, prompt) => {
                setActiveModalImage(url);
                setActiveModalPrompt(prompt);
              }}
              onSwitchToImageStudio={(prompt) => {
                setCurrentMode('image-studio');
              }}
              language={language}
            />
          ) : (
            <ImageStudioView
              onOpenImageModal={(url, prompt) => {
                setActiveModalImage(url);
                setActiveModalPrompt(prompt);
              }}
              recentImages={recentImages}
              onAddGeneratedImage={handleAddGeneratedImage}
              onClearRecentImages={handleClearRecentImages}
              onDeleteImage={handleDeleteImage}
              initialReferenceImage={referenceForStudio}
              onClearInitialReference={() => setReferenceForStudio(null)}
              currentPlan={currentPlan}
              onOpenPlans={() => setPlansModalOpen(true)}
              onHitLimit={(type, count) => handleTriggerLimitModal(type, count)}
              onUsageUpdated={() => setUsageRefreshKey((k) => k + 1)}
            />
          )}
        </main>
      </div>

      {/* Fullscreen Image Preview Modal */}
      <ImageModal
        imageUrl={activeModalImage}
        prompt={activeModalPrompt}
        onClose={() => {
          setActiveModalImage(null);
          setActiveModalPrompt(undefined);
        }}
        onUseAsReference={handleUseAsReference}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        systemPrompt={systemPrompt}
        onSaveSystemPrompt={handleSaveSystemPrompt}
        responseTone={responseTone}
        onChangeResponseTone={handleChangeResponseTone}
        language={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Plans Modal (Base, Medium, Premium with BRL and USD pricing) */}
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
      />

      {/* Daily Plan Limit Notification Modal */}
      <PlanLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        currentPlan={currentPlan}
        limitType={limitModalData.type}
        usedCount={limitModalData.count}
        onOpenPlans={() => {
          setLimitModalOpen(false);
          setPlansModalOpen(true);
        }}
      />
    </div>
  );
}
