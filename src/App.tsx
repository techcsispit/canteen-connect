import { useEffect, useState } from "react";
import Cart from "./components/Cart";
import MenuCard from "./components/MenuCard";
import Orders from "./components/Orders";
import { addToCart, changeQty, itemCount, type CartLine } from "./lib/cart";
import { addOrder, createOrder, orderToCart, parseCart, parseHistory, type Order } from "./lib/history";
import { CATEGORIES, filterMenu, MENU, sortMenu, type Category, type SortOrder } from "./lib/menu";

const CART_KEY = "canteen-cart";
const ORDERS_KEY = "canteen-orders";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("recommended");
  const [cart, setCart] = useState<CartLine[]>(() => parseCart(localStorage.getItem(CART_KEY)));
  const [orders, setOrders] = useState<Order[]>(() => parseHistory(localStorage.getItem(ORDERS_KEY)));
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<"menu" | "orders">("menu");

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  function placeOrder(total: number) {
    const placedAt = new Date().toISOString();
    const order = createOrder(String(Date.now()), cart, total, placedAt);
    setOrders((history) => addOrder(history, order));
    setCart([]);
  }

  function reorder(order: Order) {
    setCart(orderToCart(order));
    setView("menu");
    setCartOpen(true);
  }

  const items = filterMenu(sortMenu(MENU, sort), { query, category, vegOnly });

  return (
    <>
      <header className="header">
        <h1>Canteen Connect</h1>
        <div className="header-actions">
          <button className="header-link" onClick={() => setView(view === "menu" ? "orders" : "menu")}>
            {view === "menu" ? "Orders" : "Menu"}
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)}>
            Cart <span className="badge">{itemCount(cart)}</span>
          </button>
        </div>
      </header>

      <main className="page">
        {view === "orders" ? (
          <Orders orders={orders} onReorder={reorder} />
        ) : (
          <>
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
          </>
        )}
      </main>

      {cartOpen && (
        <Cart
          cart={cart}
          onChange={(id, delta) => setCart(changeQty(cart, id, delta))}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={placeOrder}
        />
      )}
    </>
  );
}
