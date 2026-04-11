import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses, IncomeEntries, GoalContributions, Goals } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import StatsCards from "@/components/dashboard/StatsCards";
import BudgetList from "@/components/dashboard/BudgetList";
import MonthNavigator from "@/components/dashboard/MonthNavigator";
import CreateBudgetDialog from "@/components/dashboard/CreateBudgetDialog";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import GoalsSummary from "@/components/dashboard/GoalsSummary";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default async function DashboardPage({
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
    .where(and(eq(Budgets.createdBy, userEmail), eq(Budgets.month, month), eq(Budgets.year, year)))
    .groupBy(Budgets.id)
    .orderBy(desc(Budgets.id));

  const recentExpenses = await db
    .select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      date: Expenses.date,
      createdAt: Expenses.createdAt,
      budgetName: Budgets.name,
      budgetIcon: Budgets.icon,
    })
    .from(Expenses)
    .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
    .where(and(eq(Budgets.createdBy, userEmail), eq(Budgets.month, month), eq(Budgets.year, year)))
    .orderBy(desc(Expenses.date))
    .limit(5);

  const incomeResult = await db
    .select({ total: sql<number>`coalesce(sum(${IncomeEntries.amount}), 0)`.as("total") })
    .from(IncomeEntries)
    .where(and(eq(IncomeEntries.createdBy, userEmail), eq(IncomeEntries.month, month), eq(IncomeEntries.year, year)));

  const goalContribResult = await db
    .select({ total: sql<number>`coalesce(sum(${GoalContributions.amount}), 0)`.as("total") })
    .from(GoalContributions)
    .where(and(eq(GoalContributions.createdBy, userEmail), eq(GoalContributions.month, month), eq(GoalContributions.year, year)));

  const goals = await db
    .select({
      id: Goals.id,
      name: Goals.name,
      icon: Goals.icon,
      targetAmount: Goals.targetAmount,
      targetDate: Goals.targetDate,
      monthlyAllocation: Goals.monthlyAllocation,
      totalSaved: sql<number>`coalesce(sum(${GoalContributions.amount}), 0)`.as("totalSaved"),
    })
    .from(Goals)
    .leftJoin(GoalContributions, eq(GoalContributions.goalId, Goals.id))
    .where(eq(Goals.createdBy, userEmail))
    .groupBy(Goals.id)
    .orderBy(Goals.id);

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.totalSpent), 0);
  const incomeAmt = Number(incomeResult[0]?.total ?? 0);
  const goalsAmt = Number(goalContribResult[0]?.total ?? 0);
  const savings = incomeAmt - totalSpent - goalsAmt;

  const categorySpend = budgets
    .map((b) => ({ name: b.name, value: Number(b.totalSpent), icon: b.icon ?? "💰" }))
    .filter((b) => b.value > 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
            {MONTH_NAMES[month - 1]} {year}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {incomeAmt > 0 ? (
              <>
                Income: <span className="font-medium text-gray-900">${incomeAmt.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                <a href={`/income?month=${month}&year=${year}`} className="ml-2 text-indigo-500 hover:text-indigo-700 text-xs">manage →</a>
              </>
            ) : (
              <a href={`/income?month=${month}&year=${year}`} className="text-indigo-500 hover:text-indigo-700 text-xs">+ Add income</a>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthNavigator month={month} year={year} />
          <CreateBudgetDialog month={month} year={year} />
        </div>
      </div>

      <StatsCards
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        totalBudgets={budgets.length}
        income={incomeAmt}
        savings={savings}
        goalsAmt={goalsAmt}
      />

      <DashboardCharts
        budgets={budgets}
        categorySpend={categorySpend}
        recentExpenses={recentExpenses}
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        goalsAmt={goalsAmt}
        income={incomeAmt}
      />

      {goals.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base lg:text-lg font-medium text-gray-900">Goals</h2>
            <a href="/goals" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">View all →</a>
          </div>
          <GoalsSummary goals={goals} />
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-3">Budgets this month</h2>
        {budgets.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">No budgets for {MONTH_NAMES[month-1]} {year} yet.</p>
            <p className="text-gray-400 text-xs mt-1">Tap "New budget" to create one.</p>
          </div>
        ) : (
          <BudgetList budgets={budgets} />
        )}
      </div>
    </div>
  );
}
