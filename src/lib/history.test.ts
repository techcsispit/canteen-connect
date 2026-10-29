import { describe, expect, it } from "vitest";
import {
  addOrder,
  createOrder,
  mergeOrders,
  orderHistoryStorageKey,
  ordersVisibleToUser,
  orderToCart,
  parseCart,
  parseHistory,
  userOrderHistory,
  type Order,
} from "./history";
import { MENU } from "./menu";

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
  it("uses a separate storage key for each authenticated user", () => {
    expect(orderHistoryStorageKey("alice-uid")).toBe("canteen-orders:alice-uid");
    expect(orderHistoryStorageKey("bob-uid")).toBe("canteen-orders:bob-uid");
    expect(orderHistoryStorageKey("alice-uid")).not.toBe(orderHistoryStorageKey("bob-uid"));
  });

  it("never exposes cached orders after switching to a different account", () => {
    const aliceHistory = userOrderHistory("alice-uid", JSON.stringify([older]));

    expect(ordersVisibleToUser(aliceHistory, "alice-uid")).toEqual([older]);
    expect(ordersVisibleToUser(aliceHistory, "bob-uid")).toEqual([]);
    expect(ordersVisibleToUser(aliceHistory, undefined)).toEqual([]);

    const bobHistory = userOrderHistory("bob-uid", JSON.stringify([newer]));
    expect(ordersVisibleToUser(bobHistory, "bob-uid")).toEqual([newer]);
    expect(ordersVisibleToUser(bobHistory, "alice-uid")).toEqual([]);
  });

  it("adds the first order to empty history", () => {
    expect(addOrder([], older)).toEqual([older]);
  });

  it("keeps previous orders and puts the newest first", () => {
    expect(addOrder([older], newer)).toEqual([newer, older]);
  });

  it("reconciles orders created from stale histories in different tabs", () => {
    const firstTabOrder = createOrder("first-tab", [{ id: 3, qty: 1 }], 177, "2026-01-03T10:00:00.000Z");
    const secondTabOrder = createOrder("second-tab", [{ id: 4, qty: 2 }], 63, "2026-01-04T10:00:00.000Z");
    const firstTabHistory = addOrder([older], firstTabOrder);
    const secondTabHistory = addOrder([older], secondTabOrder);

    expect(mergeOrders(firstTabHistory, secondTabHistory)).toEqual([secondTabOrder, firstTabOrder, older]);
  });

  it("does not duplicate orders while reconciling repeated storage updates", () => {
    const current = [newer, older];

    expect(mergeOrders(current, [newer], [older])).toBe(current);
  });

  it("accepts status updates from the real-time order source", () => {
    const received = { ...newer, status: "received" };
    const preparing = { ...newer, status: "preparing" };

    expect(mergeOrders([received], [preparing])).toEqual([preparing]);
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

  it("excludes sold-out items when converting an order to cart", () => {
    // Item 1 is Masala Dosa (available: true)
    // Item 10 is Chole Bhature (available: false)
    const mixedOrder = createOrder("mixed-1", [{ id: 1, qty: 1 }, { id: 10, qty: 2 }], 240, "2026-10-01T12:00:00Z");
    const reorderedCart = orderToCart(mixedOrder, MENU);

    expect(reorderedCart).toEqual([{ id: 1, qty: 1 }]);
    expect(reorderedCart.find((line) => line.id === 10)).toBeUndefined();
  });
});
