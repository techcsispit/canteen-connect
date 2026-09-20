# canteen-connect

Menu and ordering app for the college canteen. Built with React, TypeScript and Vite.

## Running it

You need Node 22 or newer.

```
npm install
npm run dev     # opens on http://localhost:5173
npm test
```

## How it's supposed to work

Menu
- Search matches item names, ignoring capital letters and extra spaces.
- Category tabs, "Veg only" and search can all be used together.
- "Recommended" is the order items are listed in `src/lib/menu.ts`. Sorting by price and switching back to Recommended should bring that order back.
- Sold-out items can't be added.

Cart
- The cart is saved in the browser, so it's still there after a page reload.
- Setting an item's quantity to 0 removes it.

Bill
- Coupon codes work in any case (`save10` is the same as `SAVE10`).
  - `FLAT50`: ₹50 off orders of ₹200 or more.
  - `SAVE10`: 10% off, but never more than ₹100.
- Delivery is ₹30, and free when the amount after discount is ₹300 or more.
- GST is 5% of the amount after discount.

## Code

- `src/lib/menu.ts`: menu data, search, filters, sorting
- `src/lib/cart.ts`: adding and removing items
- `src/lib/pricing.ts`: coupons, delivery, GST, totals
- `src/App.tsx`, `src/components/`: the UI
- `src/lib/*.test.ts`: tests (Vitest)

## Contributing

Fork the repo, make your changes on a new branch, and open a pull request. Run `npm test` and `npm run build` first.

If you find a bug, open an issue with the steps to reproduce it, what you expected, and what happened instead.

Part of Source Start by CSI SPIT. MIT licensed.
