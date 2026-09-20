import { useState } from "react";
import type { CartLine } from "../lib/cart";
import { MENU } from "../lib/menu";
import { calculateBill } from "../lib/pricing";

interface Props {
  cart: CartLine[];
  onChange: (id: number, delta: number) => void;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export default function Cart({ cart, onChange, onClose, onOrderPlaced }: Props) {
  const [coupon, setCoupon] = useState("");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const bill = calculateBill(cart, MENU, coupon);

  function placeOrder() {
    setOrderNumber(Math.floor(1000 + Math.random() * 9000));
    onOrderPlaced();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your order</h2>
          <button className="close" onClick={onClose} aria-label="Close cart">×</button>
        </div>

        {orderNumber !== null ? (
          <div className="placed">
            <h3>Order #{orderNumber} placed</h3>
            <p>Pick it up at the counter in about 15 minutes.</p>
          </div>
        ) : cart.length === 0 ? (
          <p className="muted">Your cart is empty.</p>
        ) : (
          <>
            <ul className="lines">
              {cart.map((line) => {
                const item = MENU.find((m) => m.id === line.id);
                if (!item) return null;
                return (
                  <li key={line.id}>
                    <span>{item.name}</span>
                    <div className="stepper">
                      <button onClick={() => onChange(line.id, -1)}>−</button>
                      <span>{line.qty}</span>
                      <button onClick={() => onChange(line.id, 1)}>+</button>
                    </div>
                    <span>₹{item.price * line.qty}</span>
                  </li>
                );
              })}
            </ul>

            <input
              className="coupon"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              aria-label="Coupon code"
            />
            {bill.couponMessage && <p className="coupon-message">{bill.couponMessage}</p>}

            <dl className="bill">
              <dt>Subtotal</dt><dd>₹{bill.subtotal}</dd>
              {bill.discount > 0 && (<><dt>Discount</dt><dd>−₹{bill.discount}</dd></>)}
              <dt>Delivery</dt><dd>{bill.delivery === 0 ? "Free" : `₹${bill.delivery}`}</dd>
              <dt>GST (5%)</dt><dd>₹{bill.gst.toFixed(2)}</dd>
              <dt className="total">Total</dt><dd className="total">₹{bill.total.toFixed(2)}</dd>
            </dl>
            <button className="place-order" onClick={placeOrder}>Place order</button>
          </>
        )}
      </aside>
    </div>
  );
}
