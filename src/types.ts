export interface RealProductPhoto {
  id: string;
  title: string;
  thumbUrl: string;
  fullUrl: string;
  mime: string;
  width?: number;
  height?: number;
  author?: string;
  license?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string; // data URL
  sources?: Array<{ title: string; url: string }>;
  isError?: boolean;
  generatedImageUrl?: string; // If this response produced an image directly
  realProductPhotos?: RealProductPhoto[]; // Real camera photos of the actual product
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  aspectRatio: string;
  style: string;
  sources?: Array<{ title: string; url: string }>;
  realProductPhotos?: RealProductPhoto[];
  createdAt: number;
}

export type AppMode = 'chat' | 'image-studio';

export type ImageStylePreset = {
  id: string;
  name: string;
  description: string;
  previewGradient: string;
};

export type AspectRatioOption = {
  id: string;
  label: string;
  ratio: string;
  iconWidth: number;
  iconHeight: number;
};

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export type Currency = 'BRL' | 'USD';

export type PlanTier = 'base' | 'medium' | 'premium';

export interface PlanLimits {
  dailyImages: number; // e.g. 5 for base, 50 for medium, Infinity for premium
  dailyMessages: number; // e.g. 25 for base, 250 for medium, Infinity for premium
  webSearchForImages: boolean;
  maxQuality: 'HD' | 'Full HD' | '4K Ultra';
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  imagesCount: number;
  messagesCount: number;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'paypal' | 'boleto';

export interface PlanInfo {
  id: PlanTier;
  name: string;
  tagline: string;
  priceBRL: string;
  priceUSD: string;
  rawPriceBRL: number;
  rawPriceUSD: number;
  periodBRL: string;
  periodUSD: string;
  popular?: boolean;
  limits: PlanLimits;
  features: string[];
  ctaLabel: string;
}
