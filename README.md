# Agora — E-Commerce Frontend

A modern, responsive e-commerce application built with **Next.js, React, TypeScript, and Tailwind CSS**, powered by a **Java Spring Boot REST API**.

Agora provides a complete shopping experience with product discovery, customer accounts, shopping carts, wishlists, checkout, order management, and an administrative dashboard.

The application is designed with a focus on usability, performance, maintainability, and secure communication with the backend.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework and application routing |
| React 19 | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Responsive styling |
| Lucide React | Icons |
| React Toastify | Notifications |
| Radix UI | Accessible confirmation dialogs |
| Java Spring Boot | Backend REST API |
| MySQL | Backend database |
| Cloudinary | Product image storage |
| Toss Payments | Payment integration |

## Features

### Customer Experience

**Product Catalog**
- Browse available products.
- View product descriptions, prices, and images.
- Browse products by category.
- Search for products.
- View product ratings and reviews.

**Authentication**
- Customer registration.
- Secure login and logout.
- Session-based authentication through the frontend API layer.
- Password recovery.

**Shopping Cart**
- Add products to the cart.
- Update product quantities.
- Remove cart items.
- View order totals.

**Wishlist**
- Save favorite products.
- Remove products from the wishlist.
- Add wishlist products to the shopping cart.

**Checkout**
- Review selected products.
- Enter delivery information.
- Create orders.
- View order and payment details.

**Payments**
- Toss Payments integration.
- Payment preparation and confirmation endpoints.
- Payment status verification.
- Test payment functionality.

**Order Management**
- View order history.
- View individual order details.
- Track order status.
- Request order cancellation.
- View shipment information.
- Confirm delivery where applicable.

**Reviews**
- View product reviews.
- Submit product ratings and reviews.
- Manage eligible reviews.

### Administration

Agora includes an administrative interface for managing store operations.

**Product Management**
- Create products.
- Update product information.
- Manage product images.
- Upload images to Cloudinary.
- Select primary product images.
- Delete images.
- Archive and restore products.

**Inventory Management**
- View inventory information.
- Record stock movements.
- Review inventory history.

**Order Management**
- View customer orders.
- Update order statuses.
- Manage shipment information.
- Mark shipments as delivered.

**Customer Management**
- View customer information.
- Access customer details.

---

## Application Architecture

Agora uses Next.js App Router and a server-side API layer to communicate with Spring Boot.

```text
┌──────────────────────────────┐
│         Web Browser          │
│                              │
│   Customer / Admin UI        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Next.js Frontend       │
│                              │
│  React Components            │
│  App Router                   │
│  Server Components           │
│  API Route Handlers          │
│  Session Management          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│                              │
│  Authentication              │
│  Products                    │
│  Orders                      │
│  Payments                    │
│  Inventory                   │
│  Shipments                   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          MySQL               │
└──────────────────────────────┘
```

The backend also integrates with external services, including Cloudinary for product images and Toss Payments for payment processing.

### API Communication

The frontend communicates with Spring Boot through Next.js API route handlers.

Example:

```text
Browser
   |
   | DELETE /api/admin/products/43/images/175
   |
   ▼
Next.js API Route
   |
   | Authorization: Bearer <access-token>
   |
   ▼
Spring Boot REST API
   |
   ▼
MySQL / Cloudinary
```

This architecture helps keep backend authentication credentials out of browser-side code.

---

## Project Structure

```text
agora/
├── public/
│
├── src/
│   ├── app/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── register/
│   │   ├── wishlist/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── providers/
│   │   ├── reviews/
│   │   ├── storefront/
│   │   ├── ui/
│   │   └── wishlist/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── backend.ts
│   │   └── session.ts
│   │
│   ├── types/
│   │
│   └── proxy.ts
│
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

The directory structure separates application routes, reusable UI components, API communication, and shared TypeScript types.

---

## Getting Started

### Prerequisites

Before running Agora, install:

- Node.js compatible with Next.js 16
- pnpm
- Git

You will also need a running instance of the Agora Spring Boot backend.

### 1. Clone the Repository

```bash
git clone <frontend-repository-url>
cd agora
```

Replace `<frontend-repository-url>` with the actual frontend repository URL.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
SPRING_API_URL=http://localhost:8080
APP_ORIGIN=http://localhost:3000
```

These values assume that the Spring Boot API is accessible at port `8080` and the frontend runs at port `3000`.

If the backend uses another host or port, update `SPRING_API_URL` accordingly.

Additional environment variables may be required depending on the configured authentication and payment integrations.

**Never commit production credentials, access tokens, or payment secret keys.**

### 4. Start the Development Server

```bash
pnpm dev
```

Open the application at:

`http://localhost:3000`

### 5. Build for Production

```bash
pnpm build
```

### 6. Start the Production Server

```bash
pnpm start
```

### 7. Run TypeScript Checks

```bash
pnpm exec tsc --noEmit
```

### 8. Run ESLint

```bash
pnpm lint
```

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm exec tsc --noEmit` | Check TypeScript types |

---

## Authentication and Authorization

Agora separates customer and administrator functionality.

### Customer

Authenticated customers can:

- Manage their account.
- Add products to the cart.
- Manage their wishlist.
- Place orders.
- Access their order history.
- Manage eligible orders.

### Administrator

Administrators can access the management dashboard to:

- Manage products.
- Manage inventory.
- Review orders.
- Update shipment information.
- Access customer management features.

Protected backend requests use the authenticated session to attach an access token.

Authorization is enforced by the Spring Boot backend. Frontend role-based navigation is not a substitute for backend authorization.

---

## Payment Integration

Agora integrates with Toss Payments.

The frontend includes API handlers for payment operations such as:

```text
/api/orders/[id]/payment/toss/prepare
/api/orders/[id]/payment/toss/confirm
/api/orders/[id]/payment/toss/status
/api/orders/[id]/payment/toss/recover
```

Payment-sensitive operations are processed through the backend.

### Payment Safety

The application is designed to avoid relying solely on client-side payment results.

The backend is responsible for:

- Verifying payment information.
- Checking payment amounts.
- Validating payment status.
- Handling payment conflicts.
- Coordinating cancellation and refund operations.

**Payment integration should be fully tested before enabling live transactions.**

---

## Product Image Management

Product images are managed through the administrative dashboard.

The image management interface supports:

- Uploading product images.
- Selecting a primary image.
- Deleting individual images.
- Managing multiple images per product.
- Identifying legacy broken seed images.

Uploaded product images are stored using Cloudinary through the backend.

Supported upload formats include:

```text
JPEG
PNG
WebP
```

The current frontend image manager enforces a maximum upload size of **5 MB per image**.

---

## Notifications and Dialogs

Agora uses two complementary UI systems.

### React Toastify

Used for notifications such as:

- Successful login.
- Successful registration.
- Cart updates.
- Wishlist updates.
- Checkout errors.
- API operation results.

### Radix Alert Dialog

Used for accessible confirmation dialogs, including destructive or sensitive actions.

Examples include:

- Product deletion.
- Product image deletion.
- Order cancellation.
- Delivery confirmation.

The goal is to provide consistent, application-branded feedback instead of native browser alerts.

---

## Responsive Design

Agora is designed for different screen sizes, including:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile devices.

The interface uses Tailwind CSS for responsive layouts, navigation, forms, product cards, and dashboard components.

---

## Security Considerations

Agora uses several frontend and backend security measures.

**Authentication**

Protected API requests use the authenticated session.

**Authorization**

Administrator operations require the appropriate backend permissions.

**CSRF Protection**

The Next.js request proxy checks the request origin for state-changing API requests.

**Server-Side API Communication**

Backend access tokens are attached server-side rather than directly exposed through frontend components.

**Payment Verification**

Payment amounts and payment states must be validated by the backend.

**Environment Variables**

Secrets and private configuration should remain outside version control.

---

## Development Status

Agora is an actively developed e-commerce project.

Core storefront, authentication, shopping cart, wishlist, checkout, order management, and administration functionality have been implemented.

Some integrations and operational workflows are still undergoing testing and refinement, including payment reconciliation, order cancellation edge cases, shipment operations, and legacy product-image cleanup.

---

## Future Improvements

Potential enhancements include:

- Improved payment reconciliation.
- Additional order tracking capabilities.
- Enhanced inventory reporting.
- Advanced product search and filtering.
- Additional administrative analytics.
- Improved accessibility and automated testing.
- Further performance optimizations.

---

## Backend

Agora uses a separate Java Spring Boot backend.

**Backend technologies:**

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL
- Docker
- Cloudinary
- Toss Payments

The frontend and backend are maintained as separate applications.

---

## Author

**Eddy Mouity**

Backend / Full-Stack Developer

**Portfolio:** [eddymouity.dev](https://www.eddymouity.dev/en)

**GitHub:** [joss12](https://github.com/joss12)

---

## License

No license is specified in this README. Refer to the repository's `LICENSE` file, if present, for applicable usage and distribution terms.
