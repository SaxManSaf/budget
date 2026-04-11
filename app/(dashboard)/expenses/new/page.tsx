import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import AddExpenseFormFull from "@/components/dashboard/AddExpenseFormFull";

export const dynamic = "force-dynamic";

export default async function NewExpensePage({
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
    .select()
    .from(Budgets)
    .where(
      and(
        eq(Budgets.createdBy, userEmail),
        eq(Budgets.month, month),
        eq(Budgets.year, year)
      )
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add expense</h1>
        <p className="text-gray-500 text-sm mt-1">
          Log a new transaction against a budget.
        </p>
      </div>
      <AddExpenseFormFull budgets={budgets} month={month} year={year} />
    </div>
  );
}
