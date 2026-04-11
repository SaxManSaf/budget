import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Goals, GoalContributions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import GoalList from "@/components/dashboard/GoalList";
import CreateGoalDialog from "@/components/dashboard/CreateGoalDialog";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const goals = await db
    .select({
      id: Goals.id,
      name: Goals.name,
      icon: Goals.icon,
      targetAmount: Goals.targetAmount,
      targetDate: Goals.targetDate,
      monthlyAllocation: Goals.monthlyAllocation,
      createdAt: Goals.createdAt,
      totalSaved: sql<number>`coalesce(sum(${GoalContributions.amount}), 0)`.as("totalSaved"),
    })
    .from(Goals)
    .leftJoin(GoalContributions, eq(GoalContributions.goalId, Goals.id))
    .where(eq(Goals.createdBy, userEmail))
    .groupBy(Goals.id)
    .orderBy(Goals.id);

  // Fetch all contributions per goal for history
  const contributions = await db
    .select()
    .from(GoalContributions)
    .where(eq(GoalContributions.createdBy, userEmail))
    .orderBy(desc(GoalContributions.createdAt));

  const totalSaved = goals.reduce((s, g) => s + Number(g.totalSaved), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const complete = goals.filter(g => Number(g.totalSaved) >= Number(g.targetAmount)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Goals</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} · ${totalSaved.toLocaleString("en-AU", { minimumFractionDigits: 2 })} saved of ${totalTarget.toLocaleString("en-AU", { minimumFractionDigits: 2 })} total
            {complete > 0 && <span className="ml-2 text-green-600 font-medium">· {complete} complete 🎉</span>}
          </p>
        </div>
        <CreateGoalDialog />
      </div>
      <GoalList goals={goals} contributions={contributions} />
    </div>
  );
}
