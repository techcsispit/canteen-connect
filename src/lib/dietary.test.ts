import { describe, it, expect } from "vitest";
import {
  ALL_DIETARY_TAGS,
  DIETARY_CONFIG,
  MENU_DIETARY_MAP,
  getDietaryTags,
  matchesDietaryFilter,
  filterByDietary,
} from "./dietary";
import { MENU } from "./menu";

describe("dietary", () => {
  it("provides comprehensive metadata for all dietary tags", () => {
    expect(ALL_DIETARY_TAGS).toEqual(["jain", "vegan", "glutenFree", "highProtein"]);
    for (const tag of ALL_DIETARY_TAGS) {
      const config = DIETARY_CONFIG[tag];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.badge).toBeTruthy();
      expect(config.description).toBeTruthy();
    }
  });

  it("correctly looks up dietary tags for verified menu items", () => {
    expect(getDietaryTags(1)).toEqual(["jain", "vegan", "glutenFree"]); // Masala Dosa
    expect(getDietaryTags(2)).toEqual(["vegan"]); // Vada Pav
    expect(getDietaryTags(3)).toEqual(["highProtein", "glutenFree"]); // Chicken Biryani
    expect(getDietaryTags(9999)).toEqual([]); // Unknown item
  });

  it("evaluates single and multiple dietary criteria accurately", () => {
    // Masala Dosa matches jain, vegan, and glutenFree
    expect(matchesDietaryFilter(1, ["jain"])).toBe(true);
    expect(matchesDietaryFilter(1, ["vegan"])).toBe(true);
    expect(matchesDietaryFilter(1, ["glutenFree"])).toBe(true);
    expect(matchesDietaryFilter(1, ["jain", "glutenFree"])).toBe(true);
    expect(matchesDietaryFilter(1, ["highProtein"])).toBe(false);

    // Empty filter matches everything
    expect(matchesDietaryFilter(1, [])).toBe(true);
    expect(matchesDietaryFilter(3, [])).toBe(true);
  });

  it("filters menu list respecting all selected dietary constraints", () => {
    const jainItems = filterByDietary(MENU, ["jain"]);
    expect(jainItems.length).toBeGreaterThan(0);
    expect(jainItems.every((item) => (MENU_DIETARY_MAP[item.id] ?? []).includes("jain"))).toBe(true);

    const highProteinItems = filterByDietary(MENU, ["highProtein"]);
    expect(highProteinItems.length).toBeGreaterThan(0);
    expect(highProteinItems.every((item) => (MENU_DIETARY_MAP[item.id] ?? []).includes("highProtein"))).toBe(true);

    // Items that are BOTH jain AND highProtein (e.g. Veg Thali, Idli Sambar)
    const jainProtein = filterByDietary(MENU, ["jain", "highProtein"]);
    expect(jainProtein.length).toBeGreaterThan(0);
    for (const item of jainProtein) {
      const tags = MENU_DIETARY_MAP[item.id] ?? [];
      expect(tags).toContain("jain");
      expect(tags).toContain("highProtein");
    }
  });

  it("returns unchanged list when no dietary filter is provided", () => {
    expect(filterByDietary(MENU, [])).toEqual(MENU);
  });
});
