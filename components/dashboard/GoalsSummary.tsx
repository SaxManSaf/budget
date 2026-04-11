"use client";

interface Goal {
  id: number;
  name: string;
  icon: string | null;
  targetAmount: string | number;
  targetDate: string | null;
  monthlyAllocation: string | number;
  totalSaved: number;
}

export default function GoalsSummary({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {goals.map((g) => {
        const target = Number(g.targetAmount);
        const saved = Number(g.totalSaved);
        const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
        const isComplete = saved >= target;
        return (
          <a key={g.id} href="/goals" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{g.icon ?? "🎯"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                <p className="text-xs text-gray-400">
                  ${Number(saved).toLocaleString("en-AU", { minimumFractionDigits: 2 })} / ${Number(target).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
              {isComplete && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium shrink-0">Done!</span>
              )}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-indigo-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right">{pct}%</p>
          </a>
        );
      })}
    </div>
  );
}
