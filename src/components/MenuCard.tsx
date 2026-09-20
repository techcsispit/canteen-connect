import type { MenuItem } from "../lib/menu";

interface Props {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onChange: (delta: number) => void;
}

export default function MenuCard({ item, qty, onAdd, onChange }: Props) {
  return (
    <article className={item.available ? "card" : "card sold-out"}>
      <div className="card-emoji" aria-hidden="true">{item.emoji}</div>
      <div className="card-body">
        <h3>
          <span className={item.veg ? "dot veg" : "dot non-veg"} title={item.veg ? "Veg" : "Non-veg"} />
          {item.name}
        </h3>
        <p>{item.description}</p>
        <div className="card-footer">
          <strong>₹{item.price}</strong>
          {!item.available ? (
            <span className="muted">Sold out</span>
          ) : qty === 0 ? (
            <button onClick={onAdd}>Add</button>
          ) : (
            <div className="stepper">
              <button onClick={() => onChange(-1)} aria-label={`Remove one ${item.name}`}>−</button>
              <span>{qty}</span>
              <button onClick={() => onChange(1)} aria-label={`Add one ${item.name}`}>+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
