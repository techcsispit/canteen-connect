export const FAVORITES_STORAGE_KEY = "canteen-favorites";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

export function loadFavorites(storage: Storage | null = getStorage()): number[] {
  try {
    if (!storage) return [];
    const raw = storage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: number[], storage: Storage | null = getStorage()): void {
  try {
    if (!storage) return;
    const clean = Array.from(new Set(favorites)).filter((id) => Number.isInteger(id) && id > 0);
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage write failures
  }
}

export function isFavorite(favorites: number[], itemId: number): boolean {
  return favorites.includes(itemId);
}

export function toggleFavorite(
  favorites: number[],
  itemId: number,
  storage: Storage | null = getStorage()
): number[] {
  if (isFavorite(favorites, itemId)) {
    const updated = favorites.filter((id) => id !== itemId);
    saveFavorites(updated, storage);
    return updated;
  }
  const updated = [...favorites, itemId];
  saveFavorites(updated, storage);
  return updated;
}

