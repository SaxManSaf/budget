import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import AddExpenseForm from "@/components/dashboard/AddExpenseForm";
import ExpenseTable from "@/components/dashboard/ExpenseTable";
import BudgetCard from "@/components/dashboard/BudgetCard";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const [budget] = await db
    .select({
      id: Budgets.id,
      name: Budgets.name,
      amount: Budgets.amount,
      icon: Budgets.icon,
      isFavourite: Budgets.isFavourite,
      totalSpent: sql<number>`coalesce(sum(${Expenses.amount}), 0)`.as("totalSpent"),
      totalItems: sql<number>`count(${Expenses.id})`.as("totalItems"),
    })
    .from(Budgets)
    .leftJoin(Expenses, eq(Expenses.budgetId, Budgets.id))
    .where(eq(Budgets.id, Number(id)))
    .groupBy(Budgets.id);

  if (!budget || budget.id === undefined) notFound();

  const expenses = await db
    .select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      date: Expenses.date,
      createdAt: Expenses.createdAt,
      budgetId: Expenses.budgetId,
    })
    .from(Expenses)
    .where(eq(Expenses.budgetId, Number(id)))
    .orderBy(desc(Expenses.createdAt));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
          {budget.icon} {budget.name}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage expenses for this budget.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <BudgetCard budget={budget} />
          <AddExpenseForm budgetId={budget.id} userEmail={userEmail} />
        </div>
        <div className="lg:col-span-2">
          <ExpenseTable expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
