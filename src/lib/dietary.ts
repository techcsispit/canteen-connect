import type { MenuItem } from "./menu";

export type DietaryTag = "jain" | "vegan" | "glutenFree" | "highProtein";

export interface DietaryInfo {
  tag: DietaryTag;
  label: string;
  badge: string;
  description: string;
}

export const DIETARY_CONFIG: Record<DietaryTag, DietaryInfo> = {
  jain: {
    tag: "jain",
    label: "Jain Friendly",
    badge: "🌱 Jain",
    description: "Prepared without onions, garlic, or root vegetables",
  },
  vegan: {
    tag: "vegan",
    label: "100% Vegan",
    badge: "🌿 Vegan",
    description: "100% plant-based with zero dairy or animal derivatives",
  },
  glutenFree: {
    tag: "glutenFree",
    label: "Gluten Conscious",
    badge: "🌾 Gluten-Free",
    description: "Prepared with non-wheat ingredients (rice, lentils, corn)",
  },
  highProtein: {
    tag: "highProtein",
    label: "High Protein",
    badge: "💪 High Protein",
    description: "Contains 12g+ protein per serving (paneer, chicken, dal, eggs)",
  },
};

export const ALL_DIETARY_TAGS: DietaryTag[] = ["jain", "vegan", "glutenFree", "highProtein"];

/**
 * Verified dietary classification catalog for canteen items.
 * Items not listed default to an empty set of dietary tags.
 */
export const MENU_DIETARY_MAP: Record<number, DietaryTag[]> = {
  1: ["jain", "vegan", "glutenFree"], // Masala Dosa
  2: ["vegan"],                       // Vada Pav
  3: ["highProtein", "glutenFree"],   // Chicken Biryani
  4: ["jain", "glutenFree"],          // Masala Chai
  5: ["vegan"],                       // Samosa
  6: ["highProtein"],                 // Paneer Tikka Roll
  7: ["jain", "glutenFree"],          // Cold Coffee
  8: ["highProtein"],                 // Veg Thali
  9: ["highProtein"],                 // Egg Maggi
  10: ["vegan"],                      // Chole Bhature
  11: ["jain"],                       // Gulab Jamun
  12: ["highProtein"],                // Chicken Roll
  13: ["jain", "glutenFree"],         // Filter Coffee
  14: [],                             // Pav Bhaji (onions/butter)
  15: ["jain", "glutenFree"],         // Mango Lassi
  16: [],                             // Brownie
  17: ["jain", "vegan", "glutenFree", "highProtein"], // Idli Sambar
  18: ["jain", "vegan", "glutenFree"], // Lime Soda
  19: ["jain", "glutenFree"],         // Kulfi
  20: ["jain"],                       // Veg Sandwich
};

export function getDietaryTags(itemId: number): DietaryTag[] {
  return MENU_DIETARY_MAP[itemId] ?? [];
}

export function matchesDietaryFilter(itemId: number, selectedTags: DietaryTag[]): boolean {
  if (!selectedTags || selectedTags.length === 0) return true;
  const itemTags = getDietaryTags(itemId);
  return selectedTags.every((tag) => itemTags.includes(tag));
}

export function filterByDietary(items: MenuItem[], selectedTags: DietaryTag[]): MenuItem[] {
  if (!selectedTags || selectedTags.length === 0) return [...items];
  return items.filter((item) => matchesDietaryFilter(item.id, selectedTags));
}
