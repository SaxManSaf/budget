import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets, Expenses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ExpenseTable from "@/components/dashboard/ExpenseTable";

export default async function ExpensesPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const expenses = await db
    .select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      date: Expenses.date,
      createdAt: Expenses.createdAt,
      budgetId: Expenses.budgetId,
      budgetName: Budgets.name,
      budgetIcon: Budgets.icon,
    })
    .from(Expenses)
    .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
    .where(eq(Budgets.createdBy, userEmail))
    .orderBy(desc(Expenses.createdAt));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">All expenses</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Every transaction across all your budgets.
        </p>
      </div>
      <ExpenseTable expenses={expenses} showBudget />
    </div>
  );
}
