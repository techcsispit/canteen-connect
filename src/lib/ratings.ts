export interface Review {
  id: string;
  itemId: number;
  orderId?: string;
  userEmail: string;
  rating: number; // 1 to 5
  tags: string[]; // e.g., ["Crispy", "Quick Delivery", "Spicy"]
  comment: string;
  createdAt: string;
}

export interface ItemRatingStats {
  itemId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  popularTags: { tag: string; count: number }[];
}

export const RATINGS_STORAGE_KEY = "canteen-reviews";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

export const PRESET_REVIEW_TAGS = [
  "Crispy",
  "Fresh & Hot",
  "Great Value",
  "Generous Portion",
  "Spicy",
  "Perfect Sweetness",
  "Quick Prep",
  "Comfort Food",
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    itemId: 1, // Masala Dosa
    userEmail: "student1@spit.ac.in",
    rating: 5,
    tags: ["Crispy", "Fresh & Hot", "Great Value"],
    comment: "The coconut chutney is heavenly and the dosa is super crispy!",
    createdAt: "2026-10-25T11:30:00Z",
  },
  {
    id: "rev-2",
    itemId: 1, // Masala Dosa
    userEmail: "student2@spit.ac.in",
    rating: 4,
    tags: ["Fresh & Hot"],
    comment: "Good portion size, perfect for a filling breakfast.",
    createdAt: "2026-10-26T09:15:00Z",
  },
  {
    id: "rev-3",
    itemId: 2, // Vada Pav
    userEmail: "student3@spit.ac.in",
    rating: 5,
    tags: ["Crispy", "Spicy", "Great Value"],
    comment: "The dry red garlic chutney makes this unbeatable on campus.",
    createdAt: "2026-10-27T16:45:00Z",
  },
  {
    id: "rev-4",
    itemId: 3, // Chicken Biryani
    userEmail: "student4@spit.ac.in",
    rating: 5,
    tags: ["Generous Portion", "Fresh & Hot"],
    comment: "Tender chicken pieces and flavorful aromatic basmati rice.",
    createdAt: "2026-10-28T13:20:00Z",
  },
  {
    id: "rev-5",
    itemId: 4, // Masala Chai
    userEmail: "student5@spit.ac.in",
    rating: 5,
    tags: ["Fresh & Hot", "Comfort Food"],
    comment: "Perfect ginger punch, absolute lifesaver during morning lectures.",
    createdAt: "2026-10-28T08:50:00Z",
  },
  {
    id: "rev-6",
    itemId: 6, // Paneer Tikka Roll
    userEmail: "student6@spit.ac.in",
    rating: 4,
    tags: ["Spicy", "Generous Portion"],
    comment: "Generous paneer stuffing with smoky charcoal flavor.",
    createdAt: "2026-10-29T14:10:00Z",
  },
  {
    id: "rev-7",
    itemId: 7, // Cold Coffee
    userEmail: "student7@spit.ac.in",
    rating: 5,
    tags: ["Perfect Sweetness", "Great Value"],
    comment: "Rich, thick, and topped with chocolate ice cream. Best in college!",
    createdAt: "2026-10-29T17:00:00Z",
  },
];

export function loadReviews(storage: Storage | null = getStorage()): Review[] {
  try {
    if (!storage) return INITIAL_REVIEWS;
    const raw = storage.getItem(RATINGS_STORAGE_KEY);
    if (!raw) {
      storage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_REVIEWS;
    return parsed;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveReviews(reviews: Review[], storage: Storage | null = getStorage()): void {
  try {
    if (!storage) return;
    storage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // Ignore storage errors
  }
}

export function addReview(
  review: Omit<Review, "id" | "createdAt">,
  storage: Storage | null = getStorage()
): Review {
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const current = loadReviews(storage);
  const updated = [newReview, ...current];
  saveReviews(updated, storage);
  return newReview;
}

export function computeItemRatingStats(itemId: number, reviews: Review[]): ItemRatingStats {
  const itemReviews = reviews.filter((r) => r.itemId === itemId);
  const totalReviews = itemReviews.length;

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const tagCounts = new Map<string, number>();

  let sum = 0;
  for (const rev of itemReviews) {
    const r = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[r] = (distribution[r] || 0) + 1;
    sum += rev.rating;

    if (Array.isArray(rev.tags)) {
      for (const t of rev.tags) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
    }
  }

  const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

  const popularTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    itemId,
    averageRating,
    totalReviews,
    ratingDistribution: distribution,
    popularTags,
  };
}

export function getReviewsForItem(itemId: number, reviews: Review[]): Review[] {
  return reviews
    .filter((r) => r.itemId === itemId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
