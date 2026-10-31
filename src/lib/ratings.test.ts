import { describe, it, expect, beforeEach } from "vitest";
import {
  loadReviews,
  saveReviews,
  addReview,
  computeItemRatingStats,
  getReviewsForItem,
  INITIAL_REVIEWS,
  RATINGS_STORAGE_KEY,
  type Review,
} from "./ratings";
import { MemoryStorage } from "./test-storage";

describe("ratings", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("loads initial reviews on first run and seeds storage", () => {
    const reviews = loadReviews(storage);
    expect(reviews.length).toBe(INITIAL_REVIEWS.length);
    expect(storage.getItem(RATINGS_STORAGE_KEY)).toBeTruthy();
  });

  it("loads saved reviews from storage", () => {
    const custom: Review[] = [
      {
        id: "r1",
        itemId: 10,
        userEmail: "test@spit.ac.in",
        rating: 4,
        tags: ["Spicy"],
        comment: "Great chole",
        createdAt: "2026-10-30T10:00:00Z",
      },
    ];
    saveReviews(custom, storage);
    const loaded = loadReviews(storage);
    expect(loaded).toEqual(custom);
  });

  it("adds a new review and prepends it to existing reviews", () => {
    const newRev = addReview(
      {
        itemId: 2,
        userEmail: "aditya@spit.ac.in",
        rating: 5,
        tags: ["Crispy", "Great Value"],
        comment: "Best vada pav on campus",
      },
      storage
    );

    expect(newRev.id).toMatch(/^rev-/);
    expect(newRev.createdAt).toBeTruthy();
    expect(newRev.rating).toBe(5);

    const loaded = loadReviews(storage);
    expect(loaded[0]).toEqual(newRev);
  });

  it("computes accurate item rating statistics, distribution, and popular tags", () => {
    const reviews: Review[] = [
      {
        id: "1",
        itemId: 1,
        userEmail: "a@spit.ac.in",
        rating: 5,
        tags: ["Crispy", "Fresh & Hot"],
        comment: "Tasty",
        createdAt: "2026-10-20T10:00:00Z",
      },
      {
        id: "2",
        itemId: 1,
        userEmail: "b@spit.ac.in",
        rating: 4,
        tags: ["Crispy"],
        comment: "Good",
        createdAt: "2026-10-21T10:00:00Z",
      },
      {
        id: "3",
        itemId: 1,
        userEmail: "c@spit.ac.in",
        rating: 5,
        tags: ["Great Value", "Crispy"],
        comment: "Love it",
        createdAt: "2026-10-22T10:00:00Z",
      },
      {
        id: "4",
        itemId: 2, // different item
        userEmail: "d@spit.ac.in",
        rating: 1,
        tags: ["Spicy"],
        comment: "Too hot",
        createdAt: "2026-10-22T10:00:00Z",
      },
    ];

    const stats = computeItemRatingStats(1, reviews);
    expect(stats.itemId).toBe(1);
    expect(stats.totalReviews).toBe(3);
    // (5 + 4 + 5) / 3 = 14 / 3 = 4.6666... rounded to 4.7
    expect(stats.averageRating).toBe(4.7);
    expect(stats.ratingDistribution[5]).toBe(2);
    expect(stats.ratingDistribution[4]).toBe(1);
    expect(stats.ratingDistribution[3]).toBe(0);

    // Popular tags: "Crispy" appeared 3 times
    expect(stats.popularTags[0]).toEqual({ tag: "Crispy", count: 3 });
  });

  it("handles items with zero reviews gracefully", () => {
    const stats = computeItemRatingStats(999, []);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(stats.popularTags).toEqual([]);
  });

  it("returns reviews for an item ordered by newest first", () => {
    const reviews: Review[] = [
      {
        id: "old",
        itemId: 1,
        userEmail: "a@spit.ac.in",
        rating: 4,
        tags: [],
        comment: "Older",
        createdAt: "2026-10-10T10:00:00Z",
      },
      {
        id: "new",
        itemId: 1,
        userEmail: "b@spit.ac.in",
        rating: 5,
        tags: [],
        comment: "Newer",
        createdAt: "2026-10-20T10:00:00Z",
      },
    ];

    const result = getReviewsForItem(1, reviews);
    expect(result.map((r) => r.id)).toEqual(["new", "old"]);
  });
});
