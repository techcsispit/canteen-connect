export interface CartLine {
  id: number;
  qty: number;
}

export function addToCart(cart: CartLine[], id: number): CartLine[] {
  const line = cart.find((l) => l.id === id);
  if (line) return cart.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
  return [...cart, { id, qty: 1 }];
}

/** Change a line's quantity by +1 or -1. A line that reaches 0 is removed. */
export function changeQty(cart: CartLine[], id: number, delta: number): CartLine[] {
  return cart
    .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
    .filter((l) => l.qty > 0);
}

export function itemCount(cart: CartLine[]): number {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}
