import type { CartLine } from "./cart";
import type { MenuItem } from "./menu";

export type Coupon =
  | { kind: "flat"; amount: number; minOrder: number; description: string }
  | { kind: "percent"; percent: number; maxDiscount: number; description: string };

export const COUPONS: Record<string, Coupon> = {
  FLAT50: { kind: "flat", amount: 50, minOrder: 200, description: "₹50 off on orders of ₹200 or more" },
  SAVE10: { kind: "percent", percent: 10, maxDiscount: 100, description: "10% off, up to ₹100" },
};

export const DELIVERY_FEE = 30;
export const FREE_DELIVERY_FROM = 300;
export const GST_RATE = 0.05;

export interface Bill {
  subtotal: number;
  discount: number;
  delivery: number;
  gst: number;
  total: number;
  couponMessage: string;
}

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS[code.trim()];
}

export function discountFor(subtotal: number, coupon: Coupon | undefined): number {
  if (!coupon) return 0;
  if (coupon.kind === "flat") {
    return subtotal >= coupon.minOrder ? Math.min(coupon.amount, subtotal) : 0;
  }
  return Math.round((subtotal * coupon.percent) / 100);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateBill(cart: CartLine[], menu: MenuItem[], couponCode: string): Bill {
  const subtotal = cart.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.id);
    return sum + (item ? item.price * line.qty : 0);
  }, 0);

  let couponMessage = "";
  const coupon = couponCode.trim() ? findCoupon(couponCode) : undefined;
  if (couponCode.trim() && !coupon) couponMessage = "That coupon doesn't exist.";
  const discount = discountFor(subtotal, coupon);
  if (coupon && discount === 0 && subtotal > 0) couponMessage = `Add more items to use this coupon: ${coupon.description}.`;
  if (coupon && discount > 0) couponMessage = `Coupon applied: ${coupon.description}.`;

  const afterDiscount = subtotal - discount;
  const delivery = subtotal === 0 || afterDiscount >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const gst = round2(afterDiscount * GST_RATE);
  return { subtotal, discount, delivery, gst, total: round2(afterDiscount + delivery + gst), couponMessage };
}
