import type { CartLine } from "./cart";
import { createOrder, type Order } from "./history";

export type SaveOrder = (userId: string, items: CartLine[], total: number) => Promise<string>;

export async function saveConfirmedOrder(
  saveOrder: SaveOrder,
  userId: string,
  items: CartLine[],
  total: number,
  placedAt = new Date().toISOString(),
): Promise<Order> {
  const orderId = await saveOrder(userId, items, total);
  return createOrder(orderId, items, total, placedAt, "received");
}
