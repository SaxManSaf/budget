import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses, IncomeEntries, GoalContributions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();

  const incomeByMonth = await db
    .select({
      month: IncomeEntries.month,
      total: sql<number>`sum(${IncomeEntries.amount})`.as("total"),
    })
    .from(IncomeEntries)
    .where(and(eq(IncomeEntries.createdBy, userEmail), eq(IncomeEntries.year, parseInt(year))))
    .groupBy(IncomeEntries.month);

  const spendingByMonth = await db
    .select({
      month: Budgets.month,
      totalSpent: sql<number>`coalesce(sum(${Expenses.amount}), 0)`.as("totalSpent"),
    })
    .from(Budgets)
    .leftJoin(Expenses, eq(Expenses.budgetId, Budgets.id))
    .where(and(eq(Budgets.createdBy, userEmail), eq(Budgets.year, parseInt(year))))
    .groupBy(Budgets.month);

  const contributionsByMonth = await db
    .select({
      month: GoalContributions.month,
      total: sql<number>`coalesce(sum(${GoalContributions.amount}), 0)`.as("total"),
    })
    .from(GoalContributions)
    .where(and(eq(GoalContributions.createdBy, userEmail), eq(GoalContributions.year, parseInt(year))))
    .groupBy(GoalContributions.month);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const summary = months.map((month) => {
    const income = incomeByMonth.find((inc) => inc.month === month);
    const spending = spendingByMonth.find((s) => s.month === month);
    const contributions = contributionsByMonth.find((c) => c.month === month);
    const incomeAmt = income ? Number(income.total) : 0;
    const spentAmt = spending ? Number(spending.totalSpent) : 0;
    const goalsAmt = contributions ? Number(contributions.total) : 0;
    return {
      month,
      income: incomeAmt,
      spent: spentAmt,
      goals: goalsAmt,
      savings: incomeAmt - spentAmt - goalsAmt,
      hasData: incomeAmt > 0 || spentAmt > 0 || goalsAmt > 0,
    };
  });

  const yearlySavings = summary.reduce((s, m) => s + m.savings, 0);
  const yearlyIncome = summary.reduce((s, m) => s + m.income, 0);
  const yearlySpent = summary.reduce((s, m) => s + m.spent, 0);
  const yearlyGoals = summary.reduce((s, m) => s + m.goals, 0);

  return NextResponse.json({ summary, yearlySavings, yearlyIncome, yearlySpent, yearlyGoals, year });
}
