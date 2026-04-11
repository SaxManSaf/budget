import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { IncomeEntries } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import MonthNavigator from "@/components/dashboard/MonthNavigator";
import IncomeEntryList from "@/components/dashboard/IncomeEntryList";
import AddIncomeForm from "@/components/dashboard/AddIncomeForm";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default async function IncomePage({
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

  const entries = await db
    .select()
    .from(IncomeEntries)
    .where(
      and(
        eq(IncomeEntries.createdBy, userEmail),
        eq(IncomeEntries.month, month),
        eq(IncomeEntries.year, year)
      )
    )
    .orderBy(desc(IncomeEntries.date));

  const total = entries.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Income</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {MONTH_NAMES[month - 1]} {year} · Total:{" "}
            <span className="font-medium text-gray-900">
              ${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <MonthNavigator month={month} year={year} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form first on mobile so you don't have to scroll past a long table */}
        <div className="order-first lg:order-last">
          <AddIncomeForm month={month} year={year} />
        </div>
        <div className="lg:col-span-2 order-last lg:order-first">
          <IncomeEntryList entries={entries} />
        </div>
      </div>
    </div>
  );
}
