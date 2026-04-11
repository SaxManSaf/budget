import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const conditions = [eq(Budgets.createdBy, userEmail)];
  if (month) conditions.push(eq(Budgets.month, parseInt(month)));
  if (year) conditions.push(eq(Budgets.year, parseInt(year)));

  const budgets = await db
    .select()
    .from(Budgets)
    .where(and(...conditions));

  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const body = await req.json();
  const { name, amount, icon, month, year } = body;

  if (!name || !amount || !month || !year) {
    return NextResponse.json({ error: "Name, amount, month and year are required" }, { status: 400 });
  }

  const [budget] = await db
    .insert(Budgets)
    .values({ name, amount: String(amount), icon, month, year, createdBy: userEmail })
    .returning();

  return NextResponse.json(budget, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { isFavourite } = body;

  const [budget] = await db
    .update(Budgets)
    .set({ isFavourite })
    .where(eq(Budgets.id, Number(id)))
    .returning();

  return NextResponse.json(budget);
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(Budgets).where(eq(Budgets.id, Number(id)));
  return NextResponse.json({ success: true });
}
