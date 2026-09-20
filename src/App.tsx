import { useEffect, useState } from "react";
import Cart from "./components/Cart";
import MenuCard from "./components/MenuCard";
import { addToCart, changeQty, itemCount, type CartLine } from "./lib/cart";
import { CATEGORIES, filterMenu, MENU, sortMenu, type Category, type SortOrder } from "./lib/menu";

const CART_KEY = "canteen-cart";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("recommended");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const items = filterMenu(sortMenu(MENU, sort), { query, category, vegOnly });

  return (
    <>
      <header className="header">
        <h1>Canteen Connect</h1>
        <button className="cart-button" onClick={() => setCartOpen(true)}>
          Cart <span className="badge">{itemCount(cart)}</span>
        </button>
      </header>

      <main className="page">
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search dosa, chai, biryani..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the menu"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)} aria-label="Sort">
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
          <label className="veg-toggle">
            <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
            Veg only
          </label>
        </div>

        <nav className="tabs">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? "tab active" : "tab"} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </nav>

        {items.length === 0 ? (
          <p className="empty">Nothing matches that. Try another search.</p>
        ) : (
          <div className="grid">
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                qty={cart.find((l) => l.id === item.id)?.qty ?? 0}
                onAdd={() => setCart(addToCart(cart, item.id))}
                onChange={(delta) => setCart(changeQty(cart, item.id, delta))}
              />
            ))}
          </div>
        )}
      </main>

      {cartOpen && (
        <Cart
          cart={cart}
          onChange={(id, delta) => setCart(changeQty(cart, id, delta))}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={() => setCart([])}
        />
      )}
    </>
  );
}
