import { DailyUsage, PlanLimits, PlanTier } from '../types';

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  base: {
    dailyImages: 5,
    dailyMessages: 25,
    webSearchForImages: true,
    maxQuality: 'HD',
  },
  medium: {
    dailyImages: 50,
    dailyMessages: 250,
    webSearchForImages: true,
    maxQuality: 'Full HD',
  },
  premium: {
    dailyImages: 999999, // Unlimited
    dailyMessages: 999999, // Unlimited
    webSearchForImages: true,
    maxQuality: '4K Ultra',
  },
};

const USAGE_STORAGE_KEY = 'atlas_ai_daily_usage_v3';

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getDailyUsage(): DailyUsage {
  const todayStr = getTodayDateString();
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) {
      const parsed: DailyUsage = JSON.parse(raw);
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler uso diário:', e);
  }

  // Reset for new day
  const fresh: DailyUsage = {
    date: todayStr,
    imagesCount: 0,
    messagesCount: 0,
  };
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(fresh));
  } catch (e) {}
  return fresh;
}

export function incrementImageUsage(): DailyUsage {
  const current = getDailyUsage();
  const updated: DailyUsage = {
    ...current,
    imagesCount: current.imagesCount + 1,
  };
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function incrementMessageUsage(): DailyUsage {
  const current = getDailyUsage();
  const updated: DailyUsage = {
    ...current,
    messagesCount: current.messagesCount + 1,
  };
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function checkCanGenerateImage(plan: PlanTier): { allowed: boolean; remaining: number; max: number } {
  if (plan === 'premium') {
    return { allowed: true, remaining: 999999, max: 999999 };
  }
  const usage = getDailyUsage();
  const max = PLAN_LIMITS[plan].dailyImages;
  const remaining = Math.max(0, max - usage.imagesCount);
  return {
    allowed: remaining > 0,
    remaining,
    max,
  };
}

export function checkCanSendMessage(plan: PlanTier): { allowed: boolean; remaining: number; max: number } {
  if (plan === 'premium') {
    return { allowed: true, remaining: 999999, max: 999999 };
  }
  const usage = getDailyUsage();
  const max = PLAN_LIMITS[plan].dailyMessages;
  const remaining = Math.max(0, max - usage.messagesCount);
  return {
    allowed: remaining > 0,
    remaining,
    max,
  };
}
