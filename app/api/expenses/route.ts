import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Expenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, amount, budgetId, date } = body;

  if (!name || !amount || !budgetId || !date) {
    return NextResponse.json({ error: "name, amount, budgetId and date are required" }, { status: 400 });
  }

  const [expense] = await db
    .insert(Expenses)
    .values({ name, amount: String(amount), budgetId: Number(budgetId), date })
    .returning();

  return NextResponse.json(expense, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { name, amount, date } = body;

  const [expense] = await db
    .update(Expenses)
    .set({ name, amount: String(amount), date })
    .where(eq(Expenses.id, Number(id)))
    .returning();

  return NextResponse.json(expense);
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(Expenses).where(eq(Expenses.id, Number(id)));
  return NextResponse.json({ success: true });
}
