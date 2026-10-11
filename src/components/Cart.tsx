import { useState } from "react";
import type { CartLine } from "../lib/cart";
import { MENU } from "../lib/menu";
import { bestCouponFor, calculateBill, couponOptionsFor } from "../lib/pricing";

interface Props {
  cart: CartLine[];
  onChange: (id: number, delta: number) => void;
  onClose: () => void;
  onOrderPlaced: (total: number) => void;
}

export default function Cart({ cart, onChange, onClose, onOrderPlaced }: Props) {
  const [coupon, setCoupon] = useState("");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const bill = calculateBill(cart, MENU, coupon);
  const couponOptions = couponOptionsFor(bill.subtotal);
  const bestCoupon = bestCouponFor(bill.subtotal);

  function placeOrder() {
    setOrderNumber(Math.floor(1000 + Math.random() * 9000));
    onOrderPlaced(bill.total);
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

            <section className="coupon-options" aria-labelledby="available-coupons">
              <div className="coupon-options-header">
                <h3 id="available-coupons">Available coupons</h3>
                {bestCoupon && (
                  <button onClick={() => setCoupon(bestCoupon.code)}>Apply best</button>
                )}
              </div>
              <ul>
                {couponOptions.map((option) => {
                  const applied = coupon.trim().toUpperCase() === option.code;
                  return (
                    <li key={option.code}>
                      <div>
                        <strong>{option.code}</strong>
                        <span>{option.description}</span>
                        <small>
                          {option.eligible ? `Save ₹${option.discount}` : `Add ₹${option.amountNeeded} more`}
                        </small>
                      </div>
                      <button
                        disabled={!option.eligible || applied}
                        onClick={() => setCoupon(option.code)}
                      >
                        {applied ? "Applied" : "Apply"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

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
