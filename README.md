# Spendwise — Full Stack Expense Tracker

Built with **Next.js 15**, **Tailwind CSS**, **Drizzle ORM**, **Clerk Auth**, and **Neon PostgreSQL**.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Auth | Clerk v6 |
| ORM | Drizzle ORM v0.38 |
| Database | Neon PostgreSQL (serverless) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project structure

```
spendwise/
├── app/
│   ├── layout.tsx                    # Root layout with ClerkProvider
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   ├── sign-in/[[...sign-in]]/       # Clerk sign-in (catch-all route)
│   │   └── page.tsx
│   ├── sign-up/[[...sign-up]]/       # Clerk sign-up (catch-all route)
│   │   └── page.tsx
│   ├── (dashboard)/                  # Route group — shares the sidebar layout
│   │   ├── layout.tsx                # Sidebar layout wrapper
│   │   ├── dashboard/page.tsx        # Month-aware dashboard
│   │   ├── budgets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         # Budget detail + add expense
│   │   ├── expenses/
│   │   │   ├── page.tsx              # All expenses
│   │   │   └── new/page.tsx          # Add expense form
│   │   └── savings/page.tsx          # Monthly & yearly savings view
│   └── api/
│       ├── budgets/route.ts
│       ├── expenses/route.ts
│       ├── income/route.ts
│       └── savings/route.ts
├── components/dashboard/
│   ├── SideNav.tsx
│   ├── StatsCards.tsx
│   ├── BudgetCard.tsx
│   ├── BudgetList.tsx
│   ├── CreateBudgetDialog.tsx
│   ├── AddExpenseForm.tsx            # Inline form on budget detail page
│   ├── AddExpenseFormFull.tsx        # Full page form at /expenses/new
│   ├── ExpenseTable.tsx
│   ├── ExpenseBarChart.tsx           # Budget vs spend per budget
│   ├── SpendingByMonthChart.tsx      # Income/spent/saved per month
│   ├── RecentExpenses.tsx
│   ├── MonthNavigator.tsx            # ← / → month switcher
│   └── IncomeInput.tsx               # Inline income editor
├── db/
│   ├── index.ts                      # Drizzle + Neon client
│   └── schema/index.ts               # Budgets, Expenses, Incomes tables
├── middleware.ts                     # Clerk route protection
├── drizzle.config.ts
└── .env.local                        # Your secrets (never commit this)
```

---

## IMPORTANT — folder setup in your project

The `(dashboard)` folder uses Next.js **route groups** (parentheses in the name). This means all pages inside share the sidebar layout without the folder name appearing in the URL.

You need to manually create this structure in your project:

```
app/
├── (dashboard)/          ← parentheses are required
│   ├── layout.tsx        ← move from app/dashboard/layout.tsx
│   ├── dashboard/
│   ├── budgets/
│   ├── expenses/
│   └── savings/
```

In PowerShell:
```powershell
New-Item -ItemType Directory -Path "app\(dashboard)"
Move-Item "app\dashboard\layout.tsx" "app\(dashboard)\layout.tsx"
Move-Item "app\dashboard" "app\(dashboard)\dashboard"
Move-Item "app\budgets"   "app\(dashboard)\budgets"
Move-Item "app\expenses"  "app\(dashboard)\expenses"
Move-Item "app\savings"   "app\(dashboard)\savings"
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a new application.
2. Copy your **Publishable Key** and **Secret Key**.
3. Open `.env.local` and paste them in:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

In your Clerk dashboard, set these redirect URLs:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

### 3. Set up Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) (free tier available) and create a project.
2. Copy the **connection string** from the Neon dashboard.
3. Add it to `.env.local`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-2.aws.neon.tech/neondb?sslmode=require
```

### 4. Push the schema to your database

```bash
npm run db:push
```

Creates the `budgets`, `expenses`, and `incomes` tables.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- **Month-by-month budgeting** — use ← → on the dashboard to navigate months. Each month has its own budgets.
- **Monthly income** — set your take-home pay per month using the pencil icon on the dashboard.
- **Savings tracking** — the Savings page shows income, spending, and savings for every month of the year with a bar chart and savings rate %.
- **Budget categories** — create budgets with emoji icons, track spending against each one with a progress bar.
- **Expense dates** — every expense has a date field.
- **Delete budgets** — hover a budget card and click the trash icon (with confirmation).
- **Delete expenses** — click the trash icon on any row in the expense table.

---

## Database commands

| Command | What it does |
|---|---|
| `npm run db:push` | Push schema changes directly (good for dev) |
| `npm run db:generate` | Generate SQL migration files |
| `npm run db:migrate` | Run migration files (good for production) |
| `npm run db:studio` | Open Drizzle Studio to browse your data |

---

## What's different from the YouTube tutorial

| Thing | Tutorial | This project |
|---|---|---|
| `@clerk/nextjs` | v4 | v6 — uses `clerkMiddleware` + `createRouteMatcher` |
| Next.js | 14 | 15 — `params` and `searchParams` are now Promises, must be awaited |
| `drizzle-kit` | older config | `defineConfig` with `dialect: "postgresql"` |
| Neon driver | `@vercel/postgres` | `@neondatabase/serverless` + `drizzle-orm/neon-http` |
| Budgets | no time period | `month` + `year` columns for period tracking |
| Expenses | no date | `date` field on every expense |
| Income | not tracked | `incomes` table, set per month |
| Savings | not tracked | full savings page with monthly + yearly totals |

---

## Deploying to Vercel

1. Push your code to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Add all `.env.local` variables as Environment Variables in Vercel.
4. Deploy — Vercel detects Next.js automatically.

Run `npm run db:push` against your production database before first deploy.

