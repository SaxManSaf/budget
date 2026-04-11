import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Goals, GoalContributions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";

  const goals = await db
    .select()
    .from(Goals)
    .where(eq(Goals.createdBy, userEmail));

  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";

  const body = await req.json();
  const { name, icon, targetAmount, targetDate, monthlyAllocation } = body;

  if (!name || !targetAmount || !monthlyAllocation) {
    return NextResponse.json({ error: "name, targetAmount and monthlyAllocation are required" }, { status: 400 });
  }

  const [goal] = await db
    .insert(Goals)
    .values({ name, icon, targetAmount: String(targetAmount), targetDate: targetDate || null, monthlyAllocation: String(monthlyAllocation), createdBy: userEmail })
    .returning();

  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { name, icon, targetAmount, targetDate, monthlyAllocation } = body;

  const [goal] = await db
    .update(Goals)
    .set({ name, icon, targetAmount: String(targetAmount), targetDate: targetDate || null, monthlyAllocation: String(monthlyAllocation) })
    .where(eq(Goals.id, Number(id)))
    .returning();

  return NextResponse.json(goal);
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(Goals).where(eq(Goals.id, Number(id)));
  return NextResponse.json({ success: true });
}
