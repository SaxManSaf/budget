import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses, IncomeEntries, GoalContributions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import SpendingByMonthChart from "@/components/dashboard/SpendingByMonthChart";

export const dynamic = "force-dynamic";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default async function SavingsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";
  const year = parseInt(yearParam ?? String(new Date().getFullYear()));

  const incomeByMonth = await db
    .select({ month: IncomeEntries.month, total: sql<number>`sum(${IncomeEntries.amount})`.as("total") })
    .from(IncomeEntries)
    .where(and(eq(IncomeEntries.createdBy, userEmail), eq(IncomeEntries.year, year)))
    .groupBy(IncomeEntries.month);

  const spendingByMonth = await db
    .select({ month: Budgets.month, totalSpent: sql<number>`coalesce(sum(${Expenses.amount}), 0)`.as("totalSpent") })
    .from(Budgets)
    .leftJoin(Expenses, eq(Expenses.budgetId, Budgets.id))
    .where(and(eq(Budgets.createdBy, userEmail), eq(Budgets.year, year)))
    .groupBy(Budgets.month);

  const goalsByMonth = await db
    .select({ month: GoalContributions.month, total: sql<number>`coalesce(sum(${GoalContributions.amount}), 0)`.as("total") })
    .from(GoalContributions)
    .where(and(eq(GoalContributions.createdBy, userEmail), eq(GoalContributions.year, year)))
    .groupBy(GoalContributions.month);

  const summary = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const income = incomeByMonth.find((x) => x.month === month);
    const spending = spendingByMonth.find((x) => x.month === month);
    const goals = goalsByMonth.find((x) => x.month === month);
    const incomeAmt = income ? Number(income.total) : 0;
    const spentAmt = spending ? Number(spending.totalSpent) : 0;
    const goalsAmt = goals ? Number(goals.total) : 0;
    return { month, income: incomeAmt, spent: spentAmt, goals: goalsAmt, savings: incomeAmt - spentAmt - goalsAmt, hasData: incomeAmt > 0 || spentAmt > 0 || goalsAmt > 0 };
  });

  const yearlyIncome = summary.reduce((s, m) => s + m.income, 0);
  const yearlySpent = summary.reduce((s, m) => s + m.spent, 0);
  const yearlyGoals = summary.reduce((s, m) => s + m.goals, 0);
  const yearlySavings = yearlyIncome - yearlySpent - yearlyGoals;
  const activeMonths = summary.filter((m) => m.hasData);
  const hasGoals = activeMonths.some((m) => m.goals > 0);
  const savingsRate = yearlyIncome > 0 ? Math.round((yearlySavings / yearlyIncome) * 100) : 0;

  function fmt(n: number) {
    return `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
  }

  const bestMonth = activeMonths.length > 0 ? activeMonths.reduce((best, m) => m.savings > best.savings ? m : best) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Savings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your financial year at a glance — {year}</p>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total income</p>
          <p className="text-xl font-semibold text-gray-900">{fmt(yearlyIncome)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total spent</p>
          <p className="text-xl font-semibold text-red-500">{fmt(yearlySpent)}</p>
        </div>
        {hasGoals && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Goals allocated</p>
            <p className="text-xl font-semibold text-purple-600">{fmt(yearlyGoals)}</p>
          </div>
        )}
        <div className={`bg-white rounded-xl border p-4 ${yearlySavings >= 0 ? "border-green-100" : "border-red-100"}`}>
          <p className="text-xs text-gray-500 mb-1">Net saved</p>
          <p className={`text-xl font-semibold ${yearlySavings >= 0 ? "text-green-600" : "text-red-500"}`}>
            {yearlySavings < 0 ? "-" : ""}{fmt(yearlySavings)}
          </p>
        </div>
      </div>

      {/* Savings rate + best month */}
      {activeMonths.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-4 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
              savingsRate >= 20 ? "bg-green-100 text-green-700" :
              savingsRate >= 0 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {savingsRate}%
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Savings rate</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {savingsRate >= 20 ? "Great work! Above 20% is excellent." :
                 savingsRate >= 10 ? "Good. Aim for 20% if possible." :
                 savingsRate >= 0 ? "Try to increase your savings rate." :
                 "Spending exceeds income this year."}
              </p>
            </div>
          </div>
          {bestMonth && bestMonth.savings > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl shrink-0">🏆</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Best month</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {MONTH_NAMES[bestMonth.month - 1]} — saved {fmt(bestMonth.savings)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="mb-4">
        <SpendingByMonthChart data={summary} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Month by month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Income</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Spent</th>
                {hasGoals && <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Goals</th>}
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Saved</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Rate</th>
              </tr>
            </thead>
            <tbody>
              {activeMonths.length === 0 ? (
                <tr>
                  <td colSpan={hasGoals ? 6 : 5} className="px-4 py-12 text-center">
                    <p className="text-gray-400 text-sm">No data for {year} yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Add income and expenses to track your savings.</p>
                  </td>
                </tr>
              ) : (
                activeMonths.map((m) => {
                  const rate = m.income > 0 ? Math.round((m.savings / m.income) * 100) : 0;
                  const isBest = bestMonth?.month === m.month && m.savings > 0;
                  return (
                    <tr key={m.month} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 ${isBest ? "bg-green-50/30" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <span className="flex items-center gap-1.5">
                          {MONTH_NAMES[m.month - 1]}
                          {isBest && <span className="text-xs">🏆</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(m.income)}</td>
                      <td className="px-4 py-3 text-right text-red-500">{fmt(m.spent)}</td>
                      {hasGoals && <td className="px-4 py-3 text-right text-purple-600">{m.goals > 0 ? fmt(m.goals) : "—"}</td>}
                      <td className={`px-4 py-3 text-right font-semibold ${m.savings >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {m.savings < 0 ? "-" : ""}{fmt(m.savings)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          rate >= 20 ? "bg-green-50 text-green-700" :
                          rate >= 0 ? "bg-amber-50 text-amber-700" :
                          "bg-red-50 text-red-700"
                        }`}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {activeMonths.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-600">Year total</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{fmt(yearlyIncome)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-500">{fmt(yearlySpent)}</td>
                  {hasGoals && <td className="px-4 py-3 text-right text-sm font-semibold text-purple-600">{fmt(yearlyGoals)}</td>}
                  <td className={`px-4 py-3 text-right text-sm font-semibold ${yearlySavings >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {yearlySavings < 0 ? "-" : ""}{fmt(yearlySavings)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      savingsRate >= 20 ? "bg-green-50 text-green-700" :
                      savingsRate >= 0 ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    }`}>{savingsRate}%</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
