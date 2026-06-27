# StyleHub — Creator-Driven Fashion Marketplace

A full-stack fashion marketplace where **sellers** list clothing, **stylists**
(paid members) bundle those products into shoppable **outfits**, and
**customers** can buy a single product or an entire curated look in one click.

Stack: **Express + MongoDB (Mongoose)** backend, **React (Vite, plain JS)**
frontend, **JWT** auth, **Razorpay (Test Mode)** payments.

---

## 1. Project structure

```
stylehub/
  backend/     Express API, MongoDB models, JWT auth, Razorpay
  frontend/    React (Vite) client, Tailwind CSS
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Your MongoDB connection string (Atlas or local) — **you said you'll paste this in yourself** |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Any long random string, e.g. `openssl rand -hex 32` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com/) → sign up free → Settings → API Keys → **"Generate Test Key"**. These start with `rzp_test_...` — **no real bank account or KYC needed**, no real money ever moves |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Account & Settings → Webhooks → add a webhook (also in Test Mode) pointing at `<your-backend-url>/api/payments/webhook`, copy the secret it gives you. Optional for local dev, but nice to have wired up to show you understand webhooks |
| `SMTP_*` | Any SMTP provider (Gmail app password, Mailtrap, etc.) — optional; if left blank, emails are just logged to the console instead of sent |
| `CLOUDINARY_*` | Not wired into the backend yet — products/outfits currently take plain image **URLs** you paste in (see note below). Add Cloudinary later if you want real uploads |

> **Razorpay Test Mode**: every account starts in Test Mode by default, and
> you switch the dashboard toggle to "Live Mode" only once you want to accept
> real payments (which requires KYC/business verification). For a portfolio
> project, just stay in Test Mode forever — the integration code is
> identical either way, only the key prefix (`rzp_test_` vs `rzp_live_`)
> changes. Use Razorpay's published test card `4111 1111 1111 1111` (any
> future expiry, any CVV) or test UPI ID `success@razorpay` to simulate a
> successful payment, or `failure@razorpay` to simulate a failed one.

Run it:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

API runs on `http://localhost:5000`. Health check: `GET /api/health`.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
```

Run it:

```bash
npm run dev
```

Opens on `http://localhost:5173`. The Vite dev server proxies `/api` to
`http://localhost:5000` (see `vite.config.js`), and `withCredentials: true`
is set on axios so the refresh-token cookie works.

## 4. First-time use checklist

1. Start MongoDB (Atlas cluster or local `mongod`), paste the URI into
   `backend/.env`.
2. Start backend (`npm run dev` in `backend/`), then frontend (`npm run dev`
   in `frontend/`).
3. Register a normal account (Customer) or a Seller account from `/register`.
4. To test the **stylist flow**: register/log in as a customer → go to
   **Become a Stylist** → pay with Razorpay test mode (use card
   `4111 1111 1111 1111`, any future expiry, any CVV, or test UPI
   `success@razorpay`) → you're upgraded to `stylist` and can now build
   outfits.
5. To make yourself an **admin** for testing the admin dashboard: register
   normally, then manually edit that user's `role` field to `"admin"`
   directly in MongoDB (Compass or `mongosh`), since admin can't be
   self-assigned through the UI.
6. As a seller: **Seller Dashboard → Manage products → Add product**. For
   images, paste any public image URL (Unsplash, Cloudinary, etc.) — there's
   no file upload UI yet, just a URL field.
7. As a stylist: **Stylist Dashboard → Manage outfits → Build an outfit**,
   search for products you (or other sellers) created, add them, set
   occasion/style/season, publish.
8. As a customer: browse `/outfits`, open one, click **Buy complete
   outfit** — it expands into all the underlying products in your cart, and
   checkout charges the bundled total through Razorpay with a 5% platform /
   10% stylist commission split recorded on the order.

## 5. Notes on what's stubbed vs. fully wired

- **Payments**: fully wired — Razorpay order creation, checkout widget,
  signature verification, and a webhook endpoint, for both product/outfit
  purchases and stylist membership subscriptions. Runs entirely on Razorpay
  **Test Mode** keys, so it's safe to demo without any real money or a
  business bank account.
- **Auth**: fully wired — JWT access + refresh tokens (refresh token in an
  httpOnly cookie), email/password login, forgot/reset password, email
  verification links (emails just log to console unless you configure SMTP).
- **Images**: products and outfit covers are uploaded as real files (not URLs) — pick photos in the seller/stylist forms, they're sent to your backend and stored on **Cloudinary**, and the resulting secure URL is what gets saved on the product/outfit. Up to 6 images per product, 1 cover photo per outfit.
- **Outfit visuals**: an outfit page shows its uploaded `coverImage` if the stylist added one, or, if none, an auto-generated grid collage of the individual product photos.
- **Social / feed**: the outfit feed (`/outfits`) and stylist profile pages are a Pinterest-style masonry layout. Logged-in users can ♥ like an outfit (toggles instantly, persists via `/api/social/outfits/:id/like`), ♡ save a product to their wishlist, and follow/unfollow a stylist from their profile page — follow state and like state are loaded per-user so the heart/follow button always reflects what you've actually done.

## 6. Key API routes (for reference)

```
POST   /api/auth/register | login | refresh | logout
POST   /api/auth/forgot-password | reset-password/:token

GET    /api/products            (filters: keyword, category, gender, minPrice, maxPrice, sort)
POST   /api/products            (seller/admin)
GET    /api/outfits              (filters: occasion, style, season, maxBudget, sort)
POST   /api/outfits              (stylist with active membership)

POST   /api/upload               (seller/stylist/admin — multipart "images" field, up to 6 files, uploads to Cloudinary)

POST   /api/orders               (creates pending order from cart)
POST   /api/payments/order/:orderId/create
POST   /api/payments/order/verify
POST   /api/payments/membership/create
POST   /api/payments/membership/verify

POST   /api/social/follow/:userId
POST   /api/social/outfits/:id/like
POST   /api/social/outfits/:id/comments

GET    /api/dashboard/seller | stylist | admin
```

Full route list is in `backend/routes/`.
