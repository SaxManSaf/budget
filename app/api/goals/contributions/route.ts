import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { GoalContributions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";

  const body = await req.json();
  const { goalId, amount, month, year, note } = body;

  if (!goalId || !amount || !month || !year) {
    return NextResponse.json({ error: "goalId, amount, month and year are required" }, { status: 400 });
  }

  const [contribution] = await db
    .insert(GoalContributions)
    .values({ goalId: Number(goalId), amount: String(amount), month, year, note, createdBy: userEmail })
    .returning();

  return NextResponse.json(contribution, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { amount, note } = body;

  const [contribution] = await db
    .update(GoalContributions)
    .set({ amount: String(amount), note })
    .where(eq(GoalContributions.id, Number(id)))
    .returning();

  return NextResponse.json(contribution);
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(GoalContributions).where(eq(GoalContributions.id, Number(id)));
  return NextResponse.json({ success: true });
}
