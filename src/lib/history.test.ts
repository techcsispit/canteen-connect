import { describe, expect, it } from "vitest";
import { addOrder, createOrder, orderToCart, parseCart, parseHistory, type Order } from "./history";

const older: Order = {
  id: "older",
  items: [{ id: 1, qty: 2 }],
  total: 156,
  placedAt: "2026-01-01T10:00:00.000Z",
};

const newer: Order = {
  id: "newer",
  items: [{ id: 2, qty: 1 }],
  total: 51,
  placedAt: "2026-01-02T10:00:00.000Z",
};

describe("order history", () => {
  it("adds the first order to empty history", () => {
    expect(addOrder([], older)).toEqual([older]);
  });

  it("keeps previous orders and puts the newest first", () => {
    expect(addOrder([older], newer)).toEqual([newer, older]);
  });

  it("creates independent order and reorder snapshots", () => {
    const cart = [{ id: 1, qty: 2 }];
    const order = createOrder("one", cart, 156, older.placedAt);
    const history = addOrder([], order);
    const reordered = orderToCart(order);

    cart[0].qty = 9;
    order.items[0].qty = 7;
    reordered[0].qty = 4;
    expect(history[0].items).toEqual([{ id: 1, qty: 2 }]);
  });

  it("parses valid history and ignores invalid legacy entries", () => {
    const raw = JSON.stringify([
      older,
      { items: [{ id: 2, qty: 1 }] },
      { ...newer, items: [{ id: 2, qty: 1 }, { id: "old-id", qty: 2 }] },
    ]);
    expect(parseHistory(raw)).toEqual([newer, older]);
  });

  it("handles missing, malformed, and old non-history data", () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory("not json")).toEqual([]);
    expect(parseHistory(JSON.stringify({ id: 1, qty: 2 }))).toEqual([]);
  });

  it("normalizes the previous cart format without crashing", () => {
    expect(parseCart(JSON.stringify([{ id: 1, qty: 2 }, { id: "1", qty: 3 }, null]))).toEqual([
      { id: 1, qty: 2 },
    ]);
    expect(parseCart("broken")).toEqual([]);
  });
});
