# ENB Inventory Management

A lightweight, premium Inventory Management System built for production environments. Features full CRUD operations on inventory items, atomic stock transaction logging, image hosting, and a paginated audit trail — all powered by a modern serverless stack.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Framer Motion (animations) |
| **Database** | PostgreSQL via [Neon](https://neon.tech/) (serverless) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Image Hosting** | [Cloudinary](https://cloudinary.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Typography** | Outfit (headings) · Inter (body) |

---

## ⚙️ 1. Environment Setup

### Prerequisites
- Node.js `v18+` and `npm`
- A [Neon](https://neon.tech/) PostgreSQL database (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

### Step 1 — Clone & Install

```bash
git clone <your-repo-url>
cd enb-inventory-app
npm install
```

### Step 2 — Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and populate the following:

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"

# Cloudinary credentials (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

> You can find your Neon connection string under **Connection Details** in the Neon console.  
> Your Cloudinary credentials are under **Settings → Access Keys**.

### Step 3 — Database Schema Setup

Drizzle ORM manages the database schema. Use one of the commands below depending on your workflow:

| Command | Description |
|---|---|
| `npm run db:generate` | Generates SQL migration files from your schema changes in `src/db/schema.ts` into the `drizzle/` folder. Run this after modifying the schema. |
| `npm run db:migrate` | Applies the generated SQL migration files from the `drizzle/` folder to your database in order. Use this for production-safe, versioned migrations. |
| `npm run db:push` | Directly syncs your schema to the database **without** generating migration files. Ideal for rapid development and prototyping. |

**For initial setup, run:**

```bash
npm run db:push
```

This will create all tables (`inventory_items`, `stock_transactions`) directly on your Neon database.

---

## 🚀 2. Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Optional — Drizzle Studio (DB GUI)

```bash
npm run db:studio
```

Opens a visual browser-based interface to inspect and edit your database tables directly.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── items/          # CRUD endpoints for inventory items
│   │   └── transactions/   # Stock transaction audit log endpoint
│   ├── globals.css         # Global design tokens and base styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard (Server Component)
├── components/
│   ├── ui/                 # Reusable primitive UI components
│   ├── DashboardHeader.tsx # Header with Stock In / Out / History controls
│   ├── InventoryList.tsx   # Filterable, searchable inventory grid/list
│   ├── InventoryForm.tsx   # Create / Edit item form with image upload
│   ├── StockModals.tsx     # Stock In & Stock Out operation modals
│   └── TransactionHistoryModal.tsx  # Paginated audit log modal
├── db/
│   ├── schema.ts           # Drizzle table definitions
│   └── index.ts            # Database client initialization
└── lib/
    ├── validation.ts       # Zod schemas and input validators
    ├── cloudinary.ts       # Cloudinary upload/delete helpers
    └── utils.ts            # Shared utility functions
```

---

## ✨ Key Features

- **Full CRUD** — Create, read, update, and delete inventory items with image support
- **Stock In / Out** — Controlled stock procurement and depletion operations
- **Transaction Audit Log** — Paginated, searchable history of every stock movement
- **Cloudinary Image Uploads** — Automatic upload and cleanup of product images
- **Category Filtering** — Filter inventory by category with a single click
- **Responsive Design** — Grid and list view modes with full mobile support

---

*Developed by [Dagmawi Napoleon Bogale](https://dagmawi.et/)*