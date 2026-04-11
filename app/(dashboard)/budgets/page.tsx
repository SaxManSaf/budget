import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import BudgetList from "@/components/dashboard/BudgetList";
import CreateBudgetDialog from "@/components/dashboard/CreateBudgetDialog";
import MonthNavigator from "@/components/dashboard/MonthNavigator";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { month: monthParam, year: yearParam } = await searchParams;
  const now = new Date();
  const month = parseInt(monthParam ?? String(now.getMonth() + 1));
  const year = parseInt(yearParam ?? String(now.getFullYear()));

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const budgets = await db
    .select({
      id: Budgets.id,
      name: Budgets.name,
      amount: Budgets.amount,
      icon: Budgets.icon,
      isFavourite: Budgets.isFavourite,
      month: Budgets.month,
      year: Budgets.year,
      totalSpent: sql<number>`coalesce(sum(${Expenses.amount}), 0)`.as("totalSpent"),
      totalItems: sql<number>`count(${Expenses.id})`.as("totalItems"),
    })
    .from(Budgets)
    .leftJoin(Expenses, eq(Expenses.budgetId, Budgets.id))
    .where(
      and(
        eq(Budgets.createdBy, userEmail),
        eq(Budgets.month, month),
        eq(Budgets.year, year)
      )
    )
    .groupBy(Budgets.id)
    .orderBy(desc(Budgets.id));

  const favourites = await db
    .select()
    .from(Budgets)
    .where(and(eq(Budgets.createdBy, userEmail), eq(Budgets.isFavourite, true)))
    .orderBy(desc(Budgets.createdAt));

  const seen = new Set<string>();
  const uniqueFavourites = favourites.filter((b) => {
    if (seen.has(b.name)) return false;
    seen.add(b.name);
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budgets</h1>
          <p className="text-gray-500 text-sm mt-1">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""} for {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthNavigator month={month} year={year} />
          <CreateBudgetDialog month={month} year={year} favourites={uniqueFavourites} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {budgets.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-sm">No budgets for {MONTH_NAMES[month - 1]} {year}.</p>
            <p className="text-gray-400 text-xs mt-1">Click &quot;New budget&quot; to create one.</p>
          </div>
        ) : (
          <BudgetList budgets={budgets} />
        )}
      </div>
    </div>
  );
}
