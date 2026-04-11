import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { RecurringPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const payments = await db
    .select()
    .from(RecurringPayments)
    .where(eq(RecurringPayments.createdBy, userEmail));

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const body = await req.json();
  const { name, amount, icon, category } = body;

  if (!name || !amount) {
    return NextResponse.json({ error: "Name and amount are required" }, { status: 400 });
  }

  const [payment] = await db
    .insert(RecurringPayments)
    .values({ name, amount: String(amount), icon, category, createdBy: userEmail })
    .returning();

  return NextResponse.json(payment, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(RecurringPayments).where(eq(RecurringPayments.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { name, amount, icon, category } = body;

  const [payment] = await db
    .update(RecurringPayments)
    .set({ name, amount: String(amount), icon, category })
    .where(eq(RecurringPayments.id, Number(id)))
    .returning();

  return NextResponse.json(payment);
}
