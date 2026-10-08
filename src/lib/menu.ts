export type Category = "Snacks" | "Meals" | "Beverages" | "Desserts";

export interface MenuItem {
  id: number;
  name: string;
  category: Category;
  price: number;
  veg: boolean;
  emoji: string;
  description: string;
  available: boolean;
}

export type SortOrder = "recommended" | "price-low" | "price-high";

export interface Filters {
  query: string;
  category: Category | "All";
  vegOnly: boolean;
}

export const CATEGORIES: (Category | "All")[] = ["All", "Snacks", "Meals", "Beverages", "Desserts"];

const normalizeSearchText = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();

// Listed in "recommended" order: our most popular items first.
export const MENU: MenuItem[] = [
  { id: 1, name: "Masala Dosa", category: "Meals", price: 60, veg: true, emoji: "🥞", description: "Crispy dosa with potato masala, chutney and sambar", available: true },
  { id: 2, name: "Vada Pav", category: "Snacks", price: 20, veg: true, emoji: "🍔", description: "Mumbai's favourite, with dry garlic chutney", available: true },
  { id: 3, name: "Chicken Biryani", category: "Meals", price: 140, veg: false, emoji: "🍗", description: "Dum biryani with raita", available: true },
  { id: 4, name: "Masala Chai", category: "Beverages", price: 15, veg: true, emoji: "☕", description: "Cutting chai, extra adrak", available: true },
  { id: 5, name: "Samosa", category: "Snacks", price: 18, veg: true, emoji: "🥟", description: "Two samosas with green chutney", available: true },
  { id: 6, name: "Paneer Tikka Roll", category: "Snacks", price: 80, veg: true, emoji: "🌯", description: "Smoky paneer tikka in a rumali roti", available: true },
  { id: 7, name: "Cold Coffee", category: "Beverages", price: 50, veg: true, emoji: "🧋", description: "Thick cold coffee with ice cream", available: true },
  { id: 8, name: "Veg Thali", category: "Meals", price: 100, veg: true, emoji: "🍛", description: "Dal, sabzi, rice, 3 rotis, salad and a sweet", available: true },
  { id: 9, name: "Egg Maggi", category: "Snacks", price: 45, veg: false, emoji: "🍜", description: "Masala Maggi with scrambled egg", available: true },
  { id: 10, name: "Chole Bhature", category: "Meals", price: 90, veg: true, emoji: "🫓", description: "Two bhature with spicy chole", available: false },
  { id: 11, name: "Gulab Jamun", category: "Desserts", price: 30, veg: true, emoji: "🍡", description: "Two warm gulab jamuns", available: true },
  { id: 12, name: "Chicken Roll", category: "Snacks", price: 90, veg: false, emoji: "🌯", description: "Chicken tikka roll with mint mayo", available: true },
  { id: 13, name: "Filter Coffee", category: "Beverages", price: 25, veg: true, emoji: "☕", description: "South Indian filter coffee", available: true },
  { id: 14, name: "Pav Bhaji", category: "Meals", price: 80, veg: true, emoji: "🍲", description: "Buttery bhaji with two pavs", available: true },
  { id: 15, name: "Mango Lassi", category: "Beverages", price: 55, veg: true, emoji: "🥭", description: "Sweet lassi with alphonso pulp", available: true },
  { id: 16, name: "Brownie", category: "Desserts", price: 60, veg: false, emoji: "🍫", description: "Warm chocolate brownie (contains egg)", available: true },
  { id: 17, name: "Idli Sambar", category: "Meals", price: 50, veg: true, emoji: "🍚", description: "Three soft idlis with sambar and chutney", available: true },
  { id: 18, name: "Lime Soda", category: "Beverages", price: 30, veg: true, emoji: "🍋", description: "Sweet, salted or mixed", available: true },
  { id: 19, name: "Kulfi", category: "Desserts", price: 40, veg: true, emoji: "🍦", description: "Malai kulfi on a stick", available: false },
  { id: 20, name: "Veg Sandwich", category: "Snacks", price: 40, veg: true, emoji: "🥪", description: "Grilled sandwich with cheese", available: true },
];

export function filterMenu(items: MenuItem[], filters: Filters): MenuItem[] {
  const query = normalizeSearchText(filters.query);
  return items.filter(
    (item) =>
      (filters.category === "All" || item.category === filters.category) &&
      (!filters.vegOnly || item.veg) &&
      normalizeSearchText(item.name).includes(query),
  );
}

export function sortMenu(items: MenuItem[], order: SortOrder): MenuItem[] {
  if (order === "price-low") return [...items].sort((a, b) => a.price - b.price);
  if (order === "price-high") return [...items].sort((a, b) => b.price - a.price);
  return [...items];
}
