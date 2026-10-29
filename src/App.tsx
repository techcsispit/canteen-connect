import { useEffect, useState } from "react";
import Cart from "./components/Cart";
import MenuCard from "./components/MenuCard";
import Orders from "./components/Orders";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/admin/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { addToCart, changeQty, itemCount, type CartLine } from "./lib/cart";
import {
  createOrder,
  mergeOrders,
  orderHistoryStorageKey,
  ordersVisibleToUser,
  orderToCart,
  parseCart,
  parseHistory,
  userOrderHistory,
  type Order,
  type UserOrderHistory,
} from "./lib/history";
import { CATEGORIES, filterMenu, MENU, sortMenu, type Category, type SortOrder } from "./lib/menu";
import { saveOrderToDatabase, subscribeUserOrders } from "./lib/orders";
import { getEffectiveMenu, subscribeMenuStock, type StockOverrides } from "./lib/admin";

const CART_KEY = "canteen-cart";

function CanteenApp() {
  const { user, isAdmin, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("recommended");
  const [cart, setCart] = useState<CartLine[]>(() => parseCart(localStorage.getItem(CART_KEY)));
  const [orderHistory, setOrderHistory] = useState<UserOrderHistory>({ userId: null, orders: [] });
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<"menu" | "orders" | "admin">("menu");
  const [stockOverrides, setStockOverrides] = useState<StockOverrides>({});

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const orders = ordersVisibleToUser(orderHistory, user?.uid);

  useEffect(() => {
    if (!user) {
      setOrderHistory({ userId: null, orders: [] });
      return;
    }

    setOrderHistory(
      userOrderHistory(user.uid, localStorage.getItem(orderHistoryStorageKey(user.uid))),
    );
  }, [user]);

  useEffect(() => {
    if (!user || orderHistory.userId !== user.uid) return;
    localStorage.setItem(orderHistoryStorageKey(user.uid), JSON.stringify(orderHistory.orders));
  }, [orderHistory, user]);

  useEffect(() => {
    if (!user) return;
    const userId = user.uid;
    const storageKey = orderHistoryStorageKey(userId);

    function syncOrders(event: StorageEvent) {
      if (event.storageArea !== localStorage || event.key !== storageKey) return;
      setOrderHistory((current) =>
        current.userId === userId
          ? { ...current, orders: mergeOrders(current.orders, parseHistory(event.newValue)) }
          : current,
      );
    }

    window.addEventListener("storage", syncOrders);
    return () => window.removeEventListener("storage", syncOrders);
  }, [user]);

  // Sync real-time orders from Firestore when user is logged in
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserOrders(
      user.uid,
      (remoteOrders) => {
        setOrderHistory((current) =>
          current.userId === user.uid
            ? { ...current, orders: mergeOrders(current.orders, remoteOrders) }
            : current,
        );
      },
      (err) => {
        console.warn("Real-time orders sync error:", err);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Sync menu stock availability in real time
  useEffect(() => {
    const unsubscribe = subscribeMenuStock((overrides) => {
      setStockOverrides(overrides);
    });
    return () => unsubscribe();
  }, []);

  function openAuth(notice?: string, mode: "login" | "signup" = "login") {
    setAuthNotice(notice);
    setAuthMode(mode);
    setAuthModalOpen(true);
  }

  async function placeOrder(total: number): Promise<string> {
    if (!user) {
      openAuth("Please log in with your college email (@spit.ac.in) to place your order.");
      throw new Error("Authentication required");
    }

    const placedAt = new Date().toISOString();
    let orderId: string = crypto.randomUUID();

    try {
      const docId = await saveOrderToDatabase(user.uid, cart, total);
      if (docId) orderId = docId;
    } catch (err) {
      console.warn("Failed to push order to Firestore, recording locally:", err);
    }

    const order = createOrder(orderId, cart, total, placedAt, "received");
    const storageKey = orderHistoryStorageKey(user.uid);
    setOrderHistory((current) =>
      current.userId === user.uid
        ? {
            ...current,
            orders: mergeOrders(current.orders, parseHistory(localStorage.getItem(storageKey)), [order]),
          }
        : current,
    );
    setCart([]);
    return orderId;
  }

  function reorder(order: Order) {
    setCart(orderToCart(order, effectiveMenu));
    setView("menu");
    setCartOpen(true);
  }

  const effectiveMenu = getEffectiveMenu(MENU, stockOverrides);
  const items = filterMenu(sortMenu(effectiveMenu, sort), { query, category, vegOnly });

  return (
    <>
      <header className="header">
        <h1>Canteen Connect</h1>
        <div className="header-actions">
          <button className="header-link" onClick={() => setView(view === "menu" ? "orders" : "menu")}>
            {view === "menu" ? "Orders" : "Menu"}
          </button>
          {isAdmin && (
            <button
              className={`header-link admin-nav-btn ${view === "admin" ? "header-link-active" : ""}`}
              onClick={() => setView(view === "admin" ? "menu" : "admin")}
            >
              {view === "admin" ? "Menu" : "Admin"}
            </button>
          )}

          {user ? (
            <div className="header-auth">
              <span className="user-pill" title={user.email || ""}>
                {isAdmin ? "🛡️" : "👤"} {user.email?.split("@")[0]}
              </span>
              <button className="auth-btn logout" onClick={() => logout()}>
                Log out
              </button>
            </div>
          ) : (
            <button className="auth-btn" onClick={() => openAuth()}>
              Log in
            </button>
          )}

          <button className="cart-button" onClick={() => setCartOpen(true)}>
            Cart <span className="badge">{itemCount(cart)}</span>
          </button>
        </div>
      </header>

      <main className="page">
        {view === "admin" ? (
          <AdminDashboard
            onBackToMenu={() => setView("menu")}
            onOpenAuth={(notice) => openAuth(notice)}
          />
        ) : view === "orders" ? (
          <Orders
            orders={orders}
            onReorder={reorder}
            userEmail={user?.email}
            onOpenAuth={() => openAuth("Sign in with your SPIT college email to view your synced orders.")}
          />
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
          menu={effectiveMenu}
          onChange={(id, delta) => setCart(changeQty(cart, id, delta))}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={placeOrder}
          onOpenAuth={() => openAuth("Please log in with your college email (@spit.ac.in) to place your order.")}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialMode={authMode}
          titleNotice={authNotice}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CanteenApp />
    </AuthProvider>
  );
}
