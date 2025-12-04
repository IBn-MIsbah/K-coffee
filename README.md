# ☕ Coffee Shop Website

> A full-stack coffee shop website built with Next.js 16, Prisma, and PostgreSQL. Featuring an online menu, shopping cart, user authentication via Better-Auth, and an admin dashboard.

## 🚀 Quick Start

### Prerequisites

* Node.js 18+ and npm/pnpm/yarn
* PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/IBn-MIsbah/K-coffee.git
   cd k-coffee
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**

   * Copy `.env.example` to `.env.local`:

     ```bash
     cp .env.example .env.local
     ```
   * Update `.env.local` with your database URL and auth secrets:

     ```env
     DATABASE_URL="postgresql://username:password@localhost:5432/coffeeshop"
     BETTER_AUTH_SECRET="your-secret-key-here"
     NEXT_PUBLIC_APP_URL="http://localhost:3000"
     BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
     ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
k-coffee/
├── app/
│   ├── (auth)/            # Auth pages (Better-Auth)
│   ├── (public)/          # Customer-facing pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── sections/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts            # Better-Auth config
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
└── types/
```

## 🗄️ Database Schema

Key models:

* **User**: Authentication & profiles
* **Product**: Items (coffee, food, merch)
* **Category**: Product grouping
* **Order**: Transactions
* **OrderItem**: Order breakdown
* **Reservation**: Table booking (planned)

Use Prisma Studio:

```bash
npx prisma studio
```

## 🔧 Key Features

### ✅ Implemented

* [x] User authentication (Better-Auth)
* [x] Product catalog
* [x] Shopping cart
* [x] Responsive UI with Tailwind
* [x] Admin product management
* [x] Image uploads via Vercel Blob
* [x] Checkout flow

### 🔄 In Progress

* [ ] Payments (Stripe)
* [ ] Order tracking
* [ ] User profiles
* [ ] Reviews

### 📋 Planned

* [ ] Reservations
* [ ] Loyalty rewards
* [ ] Mobile app
* [ ] Inventory features

## 🛠️ Development Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npx prisma generate
npx prisma db push
npx prisma migrate dev
npx prisma studio
npm run type-check
```

## 📦 Dependencies

### Core

* Next.js 16
* TypeScript
* Prisma
* PostgreSQL
* Tailwind CSS

### Auth & Forms

* Better-Auth
* Zustand
* React Hook Form
* Zod

### UI

* shadcn/ui
* Lucide React

### Services

* Vercel Blob
* Stripe (upcoming)
* Resend (email)

## 🔐 Environment Variables

| Variable                | Description           | Required |
| ----------------------- | --------------------- | -------- |
| `DATABASE_URL`          | PostgreSQL connection | Yes      |
| `BETTER_AUTH_SECRET`    | Auth secret           | Yes      |
| `NEXT_PUBLIC_APP_URL`   | App URL               | Yes      |
| `BLOB_READ_WRITE_TOKEN` | Image upload          | Optional |
| `STRIPE_SECRET_KEY`     | Payments              | Optional |
| `RESEND_API_KEY`        | Email                 | Optional |

## 🚢 Deployment

### On Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## 🤝 Contributing

* Fork repo
* Create feature branch
* Commit
* Push
* Open PR

## 📝 Documentation

* Next.js
* Prisma
* Tailwind CSS
* Better-Auth

## 🐛 Troubleshooting

**DB Issues:**

* Check env vars
* Ensure PostgreSQL is running

**Auth Issues:**

* Verify secret
* Clear cookies

**Build Issues:**

* Remove `.next`
* Reinstall modules

## 📄 License

MIT License

## 🙏 Acknowledgments

* Next.js
* Prisma
* Vercel
* Community contributors

---

**"Good code is like a good cup of coffee — robust and energizing."**
