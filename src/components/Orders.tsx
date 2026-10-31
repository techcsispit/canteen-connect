import { MENU, type MenuItem } from "../lib/menu";
import type { Order } from "../lib/history";
import OrderTracker from "./OrderTracker";

interface Props {
  orders: Order[];
  onReorder: (order: Order) => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  menu?: MenuItem[];
  onRateItem?: (item: { id: number; name: string; emoji: string }) => void;
}

export default function Orders({
  orders,
  onReorder,
  userEmail,
  onOpenAuth,
  menu = MENU,
  onRateItem,
}: Props) {
  return (
    <div className="orders-container">
      {!userEmail && (
        <div className="auth-alert-banner">
          <span>🔒 Sign in with your college ID to view and sync your real-time cloud orders.</span>
          {onOpenAuth && (
            <button className="auth-alert-btn" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="empty">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <div className="order-title-row">
                    <h2>Order #{order.id.length > 8 ? order.id.slice(0, 8) : order.id}</h2>
                    <span className={`order-status-badge status-${(order.status || "received").toLowerCase()}`}>
                      {order.status || "received"}
                    </span>
                  </div>
                  <time dateTime={order.placedAt}>{new Date(order.placedAt).toLocaleString()}</time>
                </div>
                <strong>₹{order.total.toFixed(2)}</strong>
              </div>

              <OrderTracker status={order.status || "received"} />

              <ul className="order-items">
                {order.items.map((line) => {
                  const item = menu.find((menuItem) => menuItem.id === line.id);
                  return (
                    <li key={line.id} className="order-item-row">
                      <span>
                        {line.qty} × {item?.name ?? `Item ${line.id}`}
                      </span>
                      {onRateItem && item && (
                        <button
                          type="button"
                          className="item-rate-action-btn"
                          onClick={() => onRateItem({ id: item.id, name: item.name, emoji: item.emoji })}
                        >
                          ★ Rate
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="order-actions">
                <button className="reorder" onClick={() => onReorder(order)}>
                  Reorder
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
