import { describe, expect, it } from "vitest";
import { filterMenu, MENU, sortMenu } from "./menu";

const all = { query: "", category: "All" as const, vegOnly: false };

describe("filterMenu", () => {
  it("returns everything with no filters", () => {
    expect(filterMenu(MENU, all)).toHaveLength(MENU.length);
  });

  it("filters by category", () => {
    const drinks = filterMenu(MENU, { ...all, category: "Beverages" });
    expect(drinks.length).toBeGreaterThan(0);
    expect(drinks.every((i) => i.category === "Beverages")).toBe(true);
  });

  it("veg only hides non-veg items", () => {
    expect(filterMenu(MENU, { ...all, vegOnly: true }).every((i) => i.veg)).toBe(true);
  });

  it("finds items by name regardless of case", () => {
    expect(filterMenu(MENU, { ...all, query: "Dosa" }).map((i) => i.name)).toEqual(["Masala Dosa"]);
    expect(filterMenu(MENU, { ...all, query: "dosa" }).map((i) => i.name)).toEqual(["Masala Dosa"]);
  });
});

describe("sortMenu", () => {
  it("sorts by price", () => {
    const low = sortMenu([...MENU], "price-low").map((i) => i.price);
    expect(low).toEqual([...low].sort((a, b) => a - b));
    const high = sortMenu([...MENU], "price-high").map((i) => i.price);
    expect(high).toEqual([...high].sort((a, b) => b - a));
  });
});
