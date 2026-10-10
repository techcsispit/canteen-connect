import { describe, expect, it } from "vitest";
import { addToCart, changeQty, itemCount } from "./cart";
import { MENU } from "./menu";
import { calculateBill, discountFor, findCoupon } from "./pricing";

describe("cart", () => {
  it("adds and removes items", () => {
    let cart = addToCart([], 1);
    cart = addToCart(cart, 1);
    cart = addToCart(cart, 2);
    expect(itemCount(cart)).toBe(3);
    cart = changeQty(cart, 2, -1);
    expect(cart).toEqual([{ id: 1, qty: 2 }]);
  });
});

describe("coupons", () => {
  it("FLAT50 needs a ₹200 order", () => {
    expect(discountFor(199, findCoupon("FLAT50"))).toBe(0);
    expect(discountFor(200, findCoupon("FLAT50"))).toBe(50);
  });

  it("SAVE10 takes 10% off", () => {
    expect(discountFor(300, findCoupon("SAVE10"))).toBe(30);
  });

  it("SAVE10 never discounts more than ₹100", () => {
    expect(discountFor(1120, findCoupon("SAVE10"))).toBe(100);
    expect(discountFor(1400, findCoupon("SAVE10"))).toBe(100);
  });

  it("unknown coupons do nothing", () => {
    expect(findCoupon("FREEFOOD")).toBeUndefined();
  });
});

describe("calculateBill", () => {
  it("adds delivery and GST", () => {
    // 2 masala dosa = 120, delivery 30, GST 6
    const bill = calculateBill([{ id: 1, qty: 2 }], MENU, "");
    expect(bill).toMatchObject({ subtotal: 120, discount: 0, delivery: 30, gst: 6, total: 156 });
  });

  it("delivery is free from ₹300", () => {
    // 3 chicken biryani = 420
    expect(calculateBill([{ id: 3, qty: 3 }], MENU, "").delivery).toBe(0);
  });

  it("works out delivery on the amount after discount", () => {
    // 4 paneer tikka rolls = 320, FLAT50 takes it to 270, so delivery is not free
    const bill = calculateBill([{ id: 6, qty: 4 }], MENU, "FLAT50");
    expect(bill).toMatchObject({ subtotal: 320, discount: 50, delivery: 30 });
  });

  it("works out GST on the amount after discount", () => {
    // 2 chicken biryani = 280, FLAT50 takes it to 230, GST is 5% of 230
    const bill = calculateBill([{ id: 3, qty: 2 }], MENU, "FLAT50");
    expect(bill).toMatchObject({ subtotal: 280, discount: 50, delivery: 30, gst: 11.5, total: 271.5 });
  });

  it("delivery is free at exactly ₹300 and charged just below it", () => {
    // 5 masala dosa = 300
    expect(calculateBill([{ id: 1, qty: 5 }], MENU, "").delivery).toBe(0);
    // 2 chicken biryani + 1 masala chai = 295
    expect(calculateBill([{ id: 3, qty: 2 }, { id: 4, qty: 1 }], MENU, "").delivery).toBe(30);
  });

  it("delivery is free when the discount leaves exactly ₹300", () => {
    // 3 veg thali + 1 cold coffee = 350, FLAT50 takes it to 300
    const bill = calculateBill([{ id: 8, qty: 3 }, { id: 7, qty: 1 }], MENU, "FLAT50");
    expect(bill).toMatchObject({ subtotal: 350, discount: 50, delivery: 0, gst: 15, total: 315 });
  });

  it("empty cart costs nothing", () => {
    expect(calculateBill([], MENU, "SAVE10").total).toBe(0);
  });
});
