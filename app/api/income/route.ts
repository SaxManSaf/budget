import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { IncomeEntries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year) {
    return NextResponse.json({ error: "month and year required" }, { status: 400 });
  }

  const entries = await db
    .select()
    .from(IncomeEntries)
    .where(
      and(
        eq(IncomeEntries.createdBy, userEmail),
        eq(IncomeEntries.month, parseInt(month)),
        eq(IncomeEntries.year, parseInt(year))
      )
    );

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const body = await req.json();
  const { name, amount, source, month, year, date } = body;

  if (!name || !amount || !month || !year || !date) {
    return NextResponse.json(
      { error: "name, amount, month, year and date are required" },
      { status: 400 }
    );
  }

  const [entry] = await db
    .insert(IncomeEntries)
    .values({ name, amount: String(amount), source, month, year, date, createdBy: userEmail })
    .returning();

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(IncomeEntries).where(eq(IncomeEntries.id, Number(id)));
  return NextResponse.json({ success: true });
}
