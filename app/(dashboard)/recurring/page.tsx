import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { RecurringPayments, Budgets } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import RecurringList from "@/components/dashboard/RecurringList";
import CreateRecurringDialog from "@/components/dashboard/CreateRecurringDialog";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default async function RecurringPage({
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

  const payments = await db
    .select()
    .from(RecurringPayments)
    .where(eq(RecurringPayments.createdBy, userEmail))
    .orderBy(desc(RecurringPayments.createdAt));

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

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Recurring payments</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} · $
            {total.toLocaleString("en-AU", { minimumFractionDigits: 2 })} / month
          </p>
        </div>
        <CreateRecurringDialog />
      </div>
      <RecurringList
        payments={payments}
        budgets={budgets}
        month={month}
        year={year}
        monthName={MONTH_NAMES[month - 1]}
      />
    </div>
  );
}
