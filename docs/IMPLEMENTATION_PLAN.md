# Royal Care Mobile — Implementation Plan

Built from a full read of `Backend-E-Commerce-App-master` (Express + Mongoose, `/api/v1`) and
the `care` web app (React + Vite + TanStack Query). The backend is the source of truth; no
backend changes were made.

## 1. Backend facts the app relies on

| Topic | What the code does |
|---|---|
| Base URL | `${ORIGIN}/api/v1`; uploads served from `${ORIGIN}/<folder>/<file>` |
| Auth | JWT (`Authorization: Bearer`), returned by `POST /auth/login`, `/auth/signup`, `PUT /auth/resetPassword`, `PUT /users/changeMyPassword`. **No refresh token**; expiry → 401 |
| Session invalidation | 401 when token invalid/expired, user deleted, password changed after token, account deactivated |
| Roles | `user` (shopper), `manager`, `admin`. Shop routes are `user` only; catalog writes admin+manager; deletes admin only (reviews: owner, manager, admin) |
| List shape | `{ results, pagination: { currentPage, limit, numberOfPage, totalResults, next?, prev? }, data }` |
| Query params | `page`, `limit` (≤500), `sort` (`-sold,price`), `fields`, `keyword`, bracket ops `price[gte]` |
| Errors | `{ status, message }` or express-validator `{ errors: [{ msg, path }] }` (400) |
| Uploads | multipart. category/brand `image`; user `profileImg`; product `imageCover` + `images[]` (≤5), lists as JSON strings |
| Cart | items hold product **ids**; coupon cleared on any cart change; empty cart has no `_id` |
| Orders | cash: `POST /orders/:cartId {shippingAddress}`; card: Stripe Checkout session (web redirect) |
| Address | add / list / delete only — **no update endpoint** (edit = add new + delete old, as on web) |

## 2. Web page → mobile screen map

| Web page | Mobile screen | Nav type | Endpoints | Actions |
|---|---|---|---|---|
| `/` Home | HomeScreen | Tab | `GET /categories`, `/products?sort=-sold`, `/products?featured=true`, `/brands`, `/branches` | open category/product/brand, search |
| `/products` | ProductsScreen | Tab (+ pushed with preset filters) | `GET /products` (keyword, category, brand, price[gte/lte], ratingsAverage[gte], sort) | infinite scroll, search, filter sheet, sort sheet |
| `/products/:id` | ProductDetailsScreen | Stack | `GET /products/:id`, `/brands/:id`, `/products/:id/reviews` | color, qty, add to cart, wishlist, review CRUD |
| `/categories`, `/categories/:id` | CategoriesScreen, CategoryScreen | Stack | `GET /categories`, `/categories/:id`, `/categories/:id/subcategory`, `/products?category=` | browse |
| `/brands` | BrandsScreen | Stack | `GET /brands` | open products by brand |
| `/stores` | StoresScreen | Stack | `GET /branches` | map, search, city filter, near me, call, directions |
| `/login`, `/signup` | LoginScreen, SignupScreen | Modal stack (guests) | `POST /auth/login`, `/auth/signup` | |
| `/forgot-password` | ForgotPasswordScreen (3 steps) | Modal stack | `/auth/forgotPassword`, `/auth/verifyResetCode`, `PUT /auth/resetPassword` | OTP-style 6 digit code |
| `/cart` + drawer | CartScreen | Tab (badge) | `GET/DELETE /cart`, `PUT/DELETE /cart/:itemId`, `PUT /cart/applyCoupon` | qty (optimistic), remove, clear, coupon |
| `/wishlist` | WishlistScreen | Tab | `GET /wishlist`, `POST`, `DELETE /wishlist/:id` | optimistic toggle |
| `/checkout` | CheckoutScreen | Stack | `/address`, `POST /orders/:cartId`, `/orders/checkout-session/:cartId` | address → payment → review |
| `/account` | AccountScreen (menu) + EditProfileScreen | Tab / Stack | `GET /users/getMe`, `PUT /users/updateMe`, `DELETE /users/deleteMe` | edit, deactivate, language, logout |
| `/account/password` | ChangePasswordScreen | Stack | `PUT /users/changeMyPassword` | stores the new token |
| `/account/addresses` | AddressesScreen + AddressFormScreen | Stack + modal | `/address` | add, edit(replace), delete |
| `/account/orders(/:id)` | OrdersScreen, OrderDetailsScreen | Stack | `GET /orders`, `/orders/:id` | infinite list |
| `/account/reviews` | MyReviewsScreen | Stack | `GET /reviews?user=`, `DELETE /reviews/:id` | |
| `/dashboard` | StaffOverviewScreen | Staff tab | counts via `limit=1` lists, `GET /orders?limit=500` sample, low stock, best sellers | |
| `/dashboard/orders(/:id)` | StaffOrdersScreen, StaffOrderDetailScreen | Staff tab / Stack | `GET /orders` filters, `PUT /orders/:id/pay|deliver` | mark paid / delivered |
| `/dashboard/products(/new|/:id/edit)` | StaffProductsScreen, ProductFormScreen | Staff tab / Stack | `GET/POST/PUT/DELETE /products` multipart | images from library |
| `/dashboard/categories` | StaffCategoriesScreen + CategoryFormScreen | Stack + modal | `/categories` multipart | |
| `/dashboard/subcategories` | StaffSubcategoriesScreen + SubcategoryFormScreen | Stack + modal | `/subcategories`, `/categories/:id/subcategory` | |
| `/dashboard/brands` | StaffBrandsScreen + BrandFormScreen | Stack + modal | `/brands` multipart | |
| `/dashboard/coupons` | StaffCouponsScreen + CouponFormScreen | Stack + modal | `/coupon` | native date picker |
| `/dashboard/branches` | StaffBranchesScreen + BranchFormScreen | Stack + modal | `/branches?all=true` | map tap / current location |
| `/dashboard/users` | StaffUsersScreen + UserFormScreen + UserPasswordScreen | Stack + modal | `/users` multipart, `/users/changeMyPassword/:id` | role rules (managers can't touch admins) |
| `/dashboard/reviews` | StaffReviewsScreen | Stack | `GET /reviews`, `DELETE /reviews/:id` | |
| Header bell (staff) | Orders tab badge | — | `GET /orders?isDelivered=false` (polled) | |

Not ported: static marketing sections (hero copy, blog articles from `src/data/blog.ts`,
agents/“why us”). They are hard-coded web content, not backend features. Contact/agency
forms used `mailto:`; the app keeps a mailto “Contact us” entry.

## 3. Architecture

- Expo SDK 57, TypeScript strict, React Navigation 7 (native stack + bottom tabs), as requested.
- Server state: TanStack Query (infinite lists, optimistic cart/wishlist, invalidation).
- Client state: Zustand only for the session (token + user) and preferences (locale), plus toasts.
- Tokens in `expo-secure-store`; preferences in AsyncStorage.
- Forms: react-hook-form + zod schemas mirroring backend validators.
- Axios client with auth + error-normalising interceptors, 401 → session cleared → login.
- i18n en/ar (same terminology and Arabic server-message translations as the web app), RTL.

## 4. Backend limitations found (no changes made)

See `README.md` → “Backend limitations”.
