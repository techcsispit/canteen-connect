import { describe, it, expect, beforeEach } from "vitest";
import {
  loadFavorites,
  saveFavorites,
  isFavorite,
  toggleFavorite,
  FAVORITES_STORAGE_KEY,
} from "./favorites";
import { MemoryStorage } from "./test-storage";

describe("favorites", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("loads empty array when storage is empty or malformed", () => {
    expect(loadFavorites(storage)).toEqual([]);

    storage.setItem(FAVORITES_STORAGE_KEY, "invalid-json");
    expect(loadFavorites(storage)).toEqual([]);

    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ not: "an array" }));
    expect(loadFavorites(storage)).toEqual([]);
  });

  it("filters out invalid IDs from loaded favorites", () => {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([1, -5, "two", null, 3, 0]));
    expect(loadFavorites(storage)).toEqual([1, 3]);
  });

  it("saves deduplicated and sanitized favorites", () => {
    saveFavorites([1, 2, 2, 3, -1], storage);
    const stored = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || "[]");
    expect(stored).toEqual([1, 2, 3]);
  });

  it("detects whether an item is favorited", () => {
    expect(isFavorite([1, 2, 5], 2)).toBe(true);
    expect(isFavorite([1, 2, 5], 4)).toBe(false);
  });

  it("toggles favorite state on and off cleanly", () => {
    let favs: number[] = [];
    favs = toggleFavorite(favs, 1, storage);
    expect(favs).toEqual([1]);
    expect(loadFavorites(storage)).toEqual([1]);

    favs = toggleFavorite(favs, 2, storage);
    expect(favs).toEqual([1, 2]);

    favs = toggleFavorite(favs, 1, storage);
    expect(favs).toEqual([2]);
    expect(loadFavorites(storage)).toEqual([2]);
  });
});
