import { describe, expect, it } from "vitest";
import { addToCart, changeQty, itemCount } from "./cart";

describe("Cart Operations (src/lib/cart.ts)", () => {
  it("adds an item to an empty cart with qty 1", () => {
    const initialCart: Parameters<typeof addToCart>[0] = [];
    const updated = addToCart(initialCart, 1);
    expect(updated).toEqual([{ id: 1, qty: 1 }]);
  });

  it("increments quantity by 1 when adding an existing item", () => {
    const cart = [{ id: 1, qty: 1 }];
    const updated = addToCart(cart, 1);
    expect(updated).toEqual([{ id: 1, qty: 2 }]);
  });

  it("maintains other cart lines when adding a distinct item", () => {
    const cart = [{ id: 1, qty: 2 }];
    const updated = addToCart(cart, 2);
    expect(updated).toEqual([
      { id: 1, qty: 2 },
      { id: 2, qty: 1 },
    ]);
  });

  it("increases quantity using changeQty with positive delta", () => {
    const cart = [{ id: 1, qty: 2 }];
    const updated = changeQty(cart, 1, 1);
    expect(updated).toEqual([{ id: 1, qty: 3 }]);
  });

  it("decreases quantity using changeQty with negative delta", () => {
    const cart = [{ id: 1, qty: 2 }];
    const updated = changeQty(cart, 1, -1);
    expect(updated).toEqual([{ id: 1, qty: 1 }]);
  });

  it("removes an item from cart when quantity reaches 0", () => {
    const cart = [
      { id: 1, qty: 1 },
      { id: 2, qty: 3 },
    ];
    const updated = changeQty(cart, 1, -1);
    expect(updated).toEqual([{ id: 2, qty: 3 }]);
  });

  it("removes an item from cart if negative delta reduces quantity below 0", () => {
    const cart = [{ id: 1, qty: 1 }];
    const updated = changeQty(cart, 1, -5);
    expect(updated).toEqual([]);
  });

  it("returns 0 for itemCount on an empty cart", () => {
    expect(itemCount([])).toBe(0);
  });

  it("calculates total item count across multiple lines correctly", () => {
    const cart = [
      { id: 1, qty: 2 },
      { id: 2, qty: 5 },
      { id: 3, qty: 1 },
    ];
    expect(itemCount(cart)).toBe(8);
  });
});
