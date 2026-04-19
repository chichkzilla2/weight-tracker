# Mig Health Tracker

A weight tracking web application for groups, built with Next.js 14+, TypeScript, Tailwind CSS, and PostgreSQL via Neon.

## Features

- User authentication (login/logout) with NextAuth v5
- Daily weight recording
- Monthly history view with Thai Buddhist Era calendar
- Group leaderboard ranking by weight loss percentage
- Dashboard with monthly weight trend charts
- Admin panel for user and group management
- Thai-optimized UI (Sarabun font)

## Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) serverless Postgres account)

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and set:
   ```
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

## Database Setup

1. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Seed the database with sample data:
   ```bash
   npx prisma db seed
   ```

   This creates:
   - 5 groups: กลุ่มส้ม, กลุ่มกล้วย, กลุ่มแอปเปิ้ล, กลุ่มองุ่น, กลุ่มสับปะรด
   - 25 users (5 per group) with weight entries from Oct 2024 to Mar 2025
   - 1 admin user

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Accounts

| Type | Username | Password |
|------|----------|----------|
| Regular user | `user-som-1` | `password123` |
| Regular user | `user-kluay-1` | `password123` |
| Regular user | `user-apple-1` | `password123` |
| Admin | `admin` | `admin123` |

All user accounts follow the pattern `user-{group}-{1-5}` where group is one of: `som`, `kluay`, `apple`, `angoon`, `sapparot`.

## Pages

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/` | Home — record today's weight |
| `/history` | Monthly weight history |
| `/leaderboard` | Group rankings |
| `/dashboard` | Weight trend charts |
| `/profile` | User profile & settings |
| `/admin` | Admin panel (admin role only) |

## Deploying to Vercel

1. Push code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Set environment variables in Vercel project settings:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET` — random secret string
   - `NEXTAUTH_URL` — your production URL (e.g., `https://your-app.vercel.app`)
4. Deploy

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Prisma 7 with `@prisma/adapter-neon`
- **Auth**: NextAuth v5 (JWT sessions + Credentials provider)
- **Charts**: Recharts
- **Validation**: Zod v4
- **Font**: Sarabun (Google Fonts, Thai-optimized)
