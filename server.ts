import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

const PORT = 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Gemini (GEMINI_API_KEY) não encontrada nas configurações.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Atlas AI',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Chat endpoint (Answers questions, code, reasoning, multimodal analysis)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userMessage, systemPrompt, webSearch = false, attachedImage, language = 'pt-BR' } = req.body;

    if (!userMessage && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Mensagem do usuário é obrigatória.' });
    }

    const ai = getAiClient();

    // Prepare contents
    const contents: any[] = [];

    const languageNames: Record<string, string> = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English',
      'es-ES': 'Español',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
      'it-IT': 'Italiano',
      'ja-JP': '日本語 (Japanese)',
      'zh-CN': '中文 (Simplified Chinese)',
    };

    const targetLangName = languageNames[language] || 'Português (Brasil)';

    // System instruction
    const defaultSystem = `Você é o Atlas AI, uma inteligência artificial avançada, prestativa, empática e altamente inteligente.
Suas respostas devem ser claras, bem formatadas em Markdown (com títulos, listas, negrito e blocos de código quando apropriado).
Você é capaz de responder dúvidas complexas, programar, redigir textos, resolver problemas lógicos, traduzir e orientar com precisão.
IMPORTANTE: Responda SEMPRE com fluência natural no idioma selecionado pelo usuário: ${targetLangName} (código: ${language}). Mantenha um tom profissional, amigável e refinado.`;

    const effectiveSystemPrompt = systemPrompt 
      ? `${systemPrompt}\n\n[Diretriz de Idioma: Responda estritamente em ${targetLangName} (${language})]` 
      : defaultSystem;

    // Convert past history if provided
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (msg.role === 'user') {
          if (msg.image) {
            // strip prefix data:image/...;base64,
            const base64Data = msg.image.replace(/^data:image\/\w+;base64,/, '');
            const mimeMatch = msg.image.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
            contents.push({
              role: 'user',
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: msg.content || 'Analise esta imagem.' }
              ]
            });
          } else {
            contents.push({
              role: 'user',
              parts: [{ text: msg.content }]
            });
          }
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          contents.push({
            role: 'model',
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    // Append current user message
    if (userMessage) {
      if (attachedImage) {
        const base64Data = attachedImage.replace(/^data:image\/\w+;base64,/, '');
        const mimeMatch = attachedImage.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        contents.push({
          role: 'user',
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: userMessage }
          ]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      }
    }

    const config: any = {
      systemInstruction: effectiveSystemPrompt,
      temperature: 0.7,
    };

    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents,
      config,
    });

    const responseText = response.text || '';
    
    // Extract web search grounding if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Fonte da Web',
      url: chunk.web?.uri || '',
    })).filter((s: any) => s.url) || [];

    res.json({
      text: responseText,
      sources: sources,
      model: 'Atlas 3.7 Flash',
      usage: response.usageMetadata || null,
    });
  } catch (error: any) {
    console.error('Erro na rota de chat:', error);
    res.status(500).json({
      error: error.message || 'Erro ao processar a resposta do Atlas AI.',
    });
  }
});

// Image generation endpoint with real AI diffusion & Google Search Grounding
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'realistic', referenceImage, webSearch = true } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'O prompt da imagem é obrigatório.' });
    }

    const ai = getAiClient();

    // Map ratio to width/height dimensions
    const ratioMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
    };

    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';
    const dims = ratioMap[selectedRatio] || { width: 1024, height: 1024 };

    // 1. Research real-world visual facts via Google Web Search Grounding + Gemini 3.7 Flash
    let englishPrompt = prompt.trim();
    let enhancedPrompt = prompt.trim();
    let webSources: Array<{ title: string; url: string }> = [];

    try {
      const enhanceConfig: any = {};
      if (webSearch) {
        enhanceConfig.tools = [{ googleSearch: {} }];
      }

      const promptEnhanceRes = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an elite visual prompt researcher and engineer for state-of-the-art AI image diffusion models (Imagen 3, FLUX.1 Realism, Midjourney v6).
Task:
1. Search the web and research the exact real-world subject, characters, real locations, real objects, authentic textures, colors, and accurate visual references requested: "${prompt}".
2. Translate and synthesize into an authentic, ultra-faithful English prompt describing the scene in vivid detail.
3. Preserve the exact subject, action, and key details requested by the user — never replace them with generic or random approximations.
4. Style mode selected: "${style}".
   - If style is "realistic" or "cinematic" or default: include photorealistic details (e.g., natural lighting, 8k resolution, authentic textures, depth of field, award-winning photography, shot on 35mm / 85mm lens, sharp focus).
   - If style is "anime": include Japanese animation aesthetic, clean lineart, vivid colors, Makoto Shinkai / CoMix Wave style.
   - If style is "cyberpunk": include neon hues, futuristic atmosphere, reflections, octane render.
   - If style is "fantasy": include ethereal glowing aura, intricate magical details, epic digital art.
   - If style is "3d-render": include 3D Unreal Engine 5 render, smooth lighting, subsurface scattering.
5. Return ONLY the final English descriptive prompt in a single paragraph without any quotes or explanations.`,
        config: enhanceConfig,
      });

      const responseText = promptEnhanceRes.text?.trim() || '';
      if (responseText && responseText.length > 5) {
        englishPrompt = responseText.replace(/^["']|["']$/g, '').trim();
      }

      // Extract web search grounding sources if present
      const candidate = promptEnhanceRes.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      webSources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Referência Web',
          url: chunk.web?.uri || '',
        }))
        .filter((s: any) => s.url) || [];

    } catch (e) {
      console.warn('Fallback prompt translation/enhancement:', e);
    }

    // Apply explicit style modifiers if not already in prompt
    if (style === 'realistic' || style === 'cinematic') {
      enhancedPrompt = `${englishPrompt}, 8k photorealistic, raw photography, natural lighting, sharp focus, master shot, realistic texture, hyper-detailed`;
    } else if (style === 'anime') {
      enhancedPrompt = `${englishPrompt}, makoto shinkai style, high quality anime art, vibrant colors, crisp detailed illustration`;
    } else if (style === 'cyberpunk') {
      enhancedPrompt = `${englishPrompt}, cyberpunk aesthetic, neon glow, futuristic city atmosphere, octane render, 8k`;
    } else if (style === 'fantasy') {
      enhancedPrompt = `${englishPrompt}, epic fantasy digital art, ethereal luminescence, intricate ornate details, masterpiece`;
    } else if (style === 'minimalist') {
      enhancedPrompt = `${englishPrompt}, elegant minimalist vector art, clean sharp lines, soft lighting, modern aesthetic`;
    } else if (style === '3d-render') {
      enhancedPrompt = `${englishPrompt}, 3D pixar unreal engine 5 render, raytracing, soft lighting, vibrant 3D modeling, smooth`;
    } else {
      enhancedPrompt = `${englishPrompt}, high quality, ultra-detailed, photorealistic, raw masterpiece`;
    }

    let imageUrl = '';
    let usedModel = 'Google Imagen 3 Pro';

    // Tier 1: Try Google Imagen 3 (imagen-3.0-generate-002)
    try {
      const imagenResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: selectedRatio as any,
          outputMimeType: 'image/jpeg',
        }
      });
      const generated = imagenResponse.generatedImages?.[0]?.image?.imageBytes;
      if (generated) {
        imageUrl = `data:image/jpeg;base64,${generated}`;
        usedModel = 'Google Imagen 3';
      }
    } catch (imagenErr: any) {
      console.warn('Imagen 3.0 indisponível:', imagenErr?.message);
    }

    // Tier 2: Try Google Gemini 3.1 Flash Image
    if (!imageUrl) {
      try {
        if (referenceImage) {
          const base64Data = referenceImage.replace(/^data:image\/\w+;base64,/, '');
          const mimeMatch = referenceImage.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

          const imgResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: enhancedPrompt }
              ]
            },
            config: {
              imageConfig: {
                aspectRatio: selectedRatio,
              }
            }
          });

          const parts = imgResponse.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              usedModel = 'Gemini 3.1 Flash Image';
              break;
            }
          }
        } else {
          const imgResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: enhancedPrompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: selectedRatio,
              }
            }
          });

          const parts = imgResponse.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              usedModel = 'Gemini 3.1 Flash Lite Image';
              break;
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini 3.1 image endpoint indisponível:', geminiErr?.message);
      }
    }

    // Tier 3: FLUX.1 Real AI Diffusion Model (New Generation from scratch)
    if (!imageUrl) {
      const diffusionModels = ['flux', 'flux-realism', 'turbo'];
      for (const modelType of diffusionModels) {
        if (imageUrl) break;
        try {
          const seed = Math.floor(Math.random() * 89999999) + 10000000;
          const encodedPrompt = encodeURIComponent(enhancedPrompt);
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&model=${modelType}&seed=${seed}&nologo=true&enhance=true`;
          
          console.log(`Gerando arte original com motor de difusão ${modelType.toUpperCase()} para: "${englishPrompt.slice(0, 50)}..."`);
          
          const fetchController = new AbortController();
          const timeoutId = setTimeout(() => fetchController.abort(), 12000);

          const imgFetchRes = await fetch(pollinationsUrl, {
            signal: fetchController.signal,
            headers: {
              'User-Agent': 'AtlasAI/3.0 (DiffusionEngine)',
              'Accept': 'image/jpeg,image/png,image/webp,*/*'
            }
          });
          clearTimeout(timeoutId);

          if (imgFetchRes.ok) {
            const contentType = imgFetchRes.headers.get('content-type') || '';
            if (contentType.includes('image')) {
              const arrayBuffer = await imgFetchRes.arrayBuffer();
              if (arrayBuffer.byteLength > 2000) {
                const base64Data = Buffer.from(arrayBuffer).toString('base64');
                imageUrl = `data:${contentType || 'image/jpeg'};base64,${base64Data}`;
                usedModel = `Atlas Flux Diffusion Pro`;
                break;
              }
            }
          }
        } catch (neuralErr: any) {
          console.warn(`Motor neural ${modelType} falhou:`, neuralErr?.message);
        }
      }
    }

    // Tier 4: Direct Client-Side Accelerated FLUX.1 Diffusion Image URL
    if (!imageUrl) {
      const seed = Math.floor(Math.random() * 89999999) + 10000000;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&model=flux&seed=${seed}&nologo=true&enhance=true`;
      usedModel = 'Atlas FLUX.1 Diffusion High-Res';
    }

    res.json({
      imageUrl,
      prompt: prompt,
      enhancedPrompt,
      aspectRatio: selectedRatio,
      style,
      model: usedModel,
      sources: webSources,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro na rota de geração de imagem:', error);
    res.status(500).json({
      error: error.message || 'Erro ao gerar imagem com Atlas AI.',
    });
  }
});

// Start Express + Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atlas AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
