# Mirza — Better things for everyday living

A responsive luxury lifestyle storefront built with React, Tailwind CSS 4, Vite, and JavaScript. MIRZA pairs an editorial shopping experience with a local, catalogue-based shopping assistant demo.

## Getting started

Use Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Features

- Responsive editorial homepage with category cards, brand story, community quote, newsletter, and footer.
- Search suggestions, category filtering (including a curated electronics collection), and price/rating sorting.
- Curated New Arrivals, Best Sellers, and Trending edits that filter the product catalog.
- Wishlist and shopping bag saved in browser LocalStorage.
- Bag quantity controls, item removal, live item count, and subtotal.
- Product quick view and shareable hash-based product detail views with add-to-bag actions.
- MIRZA AI demo assistant that searches and recommends real catalogue products, with clear disclosure that it is not connected to an external AI service.
- Recently viewed products, editorial lifestyle gallery, FAQ, and scroll-reveal effects that honor reduced-motion preferences.
- Accessible button labels, keyboard focus styles, lazy loaded product photography, and reduced-motion support.

Checkout remains a frontend placeholder. The account page includes sign-in and account-creation forms, but no authentication service is connected; form details are not sent or stored. MIRZA AI runs as a local catalogue-based demo because this project has no backend or AI credentials; it does not send prompts to an AI provider. Catalogue prices are USD, so INR budget eligibility is not claimed. Newsletter submissions currently confirm locally and are not sent to a mailing service.

## Test cases

The requested test cases are implemented in [`src/App.test.jsx`](src/App.test.jsx). Run them with:

```bash
npm test
```

Cases cover the homepage, category and electronics filtering, search suggestions, curated edits, product details, bag quantity/subtotal, wishlist persistence, quick view, account-page validation, and catalogue-based assistant recommendations. Vitest, Testing Library, and jsdom are configured in `vite.config.js` and `src/test/setup.js`.

## Project structure

```text
src/
  components/       Header, product card, collection edits, detail page, account page, bag drawer, quick view, MIRZA AI, footer
  context/          LocalStorage backed cart and wishlist state
  data/             Product and category catalogue
  test/             Shared Vitest setup
  App.jsx           Homepage composition and collection controls
  App.test.jsx      Storefront interaction test cases
  main.jsx          React entry point
  styles.css        Tailwind import, design tokens, responsive styling
  storefront.css    Search suggestions, curated edits, product detail layout
```

## Website architecture

The site is a client-side React storefront served and bundled by Vite. `index.html` provides the root element, and `src/main.jsx` mounts the app and loads the stylesheets. `src/App.jsx` composes the page and coordinates catalog browsing, search, sorting, wishlist filtering, quick view, the cart drawer, and product detail navigation.

```text
Browser
  └─ index.html
      └─ src/main.jsx
          └─ App.jsx
              ├─ StoreProvider (shared cart and wishlist state)
              ├─ Header (navigation, search, wishlist and bag actions)
              ├─ Storefront sections (categories, edits, collection, editorial content)
              ├─ ProductCard → QuickView / ProductDetails
              ├─ CartDrawer
              ├─ MIRZA AI (catalogue-only demo recommendations)
              └─ Footer

Product catalog ──> categories, search, filters, sorting, product views
StoreContext ─────> cart and wishlist state ──> browser LocalStorage
styles.css + storefront.css ──> responsive layout and visual styling
```

`src/data/products.js` is the local source for product and category data, including the Unsplash image URL helper. `src/context/StoreContext.jsx` shares cart and wishlist state through React context and persists both collections in LocalStorage. `App.jsx` derives visible products from the catalog and current filters. Product detail views use the `#product/<id>` URL hash, allowing browser history to navigate between the collection and a product. Checkout and account actions are frontend placeholders; there is no backend, payment service, or authentication integration.

Product photography is loaded from Unsplash. The site uses Google Fonts for DM Sans and Playfair Display, with local CSS fallbacks.
