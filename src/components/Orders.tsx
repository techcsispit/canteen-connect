import { MENU } from "../lib/menu";
import type { Order } from "../lib/history";

interface Props {
  orders: Order[];
  onReorder: (order: Order) => void;
}

export default function Orders({ orders, onReorder }: Props) {
  if (orders.length === 0) return <p className="empty">You haven't placed any orders yet.</p>;

  return (
    <div className="orders">
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="order-header">
            <div>
              <h2>Order #{order.id}</h2>
              <time dateTime={order.placedAt}>{new Date(order.placedAt).toLocaleString()}</time>
            </div>
            <strong>₹{order.total.toFixed(2)}</strong>
          </div>
          <ul className="order-items">
            {order.items.map((line) => {
              const item = MENU.find((menuItem) => menuItem.id === line.id);
              return <li key={line.id}>{line.qty} × {item?.name ?? `Item ${line.id}`}</li>;
            })}
          </ul>
          <button className="reorder" onClick={() => onReorder(order)}>Reorder</button>
        </article>
      ))}
    </div>
  );
}
