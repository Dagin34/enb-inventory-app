# ENB Inventory | Enterprise Asset Management

A premium, localized Inventory Management platform designed for high-performance production environments. Built with precision, elegance, and extreme visual confidence.

## 🚀 Quick Start

### 1. Environment Setup
Clone the repository and create a `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your credentials:
- **DATABASE_URL**: Your Neon PostgreSQL connection string.
- **CLOUDINARY_***: Your Cloudinary API credentials for asset storage.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Synchronization
Push your schema to the database using Drizzle:

```bash
npm run db:push
```

### 4. Launch Development Suite
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to experience the interface.

## 🎨 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Assets**: Cloudinary for high-performance image optimization
- **Typography**: Outfit (Headings) & Inter (Body)

## 📁 Engineering Structure
- `src/app`: Application routes and core layout logic.
- `src/components`: UI/UX component library and dashboard modules.
- `src/db`: Schema definitions and database orchestration.
- `src/lib`: Validation logic and utility primitives.

---