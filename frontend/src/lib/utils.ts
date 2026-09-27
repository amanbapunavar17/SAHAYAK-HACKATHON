import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr || 'Recently';
  }
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    if (isNaN(past.getTime())) return dateStr;

    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return dateStr || 'Recently';
  }
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  ELECTRONICS: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop',
  'Electronics & Gadgets': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop',
  CALCULATORS: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop',
  DOCUMENTS_ID: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
  'College ID & Documents': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
  KEYS: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop',
  'Keys & Access Cards': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop',
  BAGS_WALLETS: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop',
  'Backpacks & Bags': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop',
  'Wallets & Money': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
  BOOKS_NOTES: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
  'Books & Notes': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
  ACCESSORIES: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
  OTHER: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop'
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop';

export function resolveImageUrl(url?: string, category?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    if (category && CATEGORY_FALLBACK_IMAGES[category]) {
      return CATEGORY_FALLBACK_IMAGES[category];
    }
    return DEFAULT_FALLBACK_IMAGE;
  }

  const cleanUrl = url.trim();

  // If already base64 or absolute web URL
  if (cleanUrl.startsWith('data:image') || cleanUrl.startsWith('blob:') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If relative path from backend uploads
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return `http://localhost:8000${path}`;
    }
    return (category && CATEGORY_FALLBACK_IMAGES[category]) ? CATEGORY_FALLBACK_IMAGES[category] : DEFAULT_FALLBACK_IMAGE;
  }

  return cleanUrl;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, category?: string) {
  const fallback = (category && CATEGORY_FALLBACK_IMAGES[category]) ? CATEGORY_FALLBACK_IMAGES[category] : DEFAULT_FALLBACK_IMAGE;
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
}

