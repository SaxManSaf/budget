interface RecentExpense {
  id: number;
  name: string;
  amount: string | number;
  createdAt: Date;
  budgetName: string;
  budgetIcon: string | null;
}

export default function RecentExpenses({
  expenses,
}: {
  expenses: RecentExpense[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Recent expenses
      </h3>
      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No expenses yet</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3">
              <span className="text-xl shrink-0">{e.budgetIcon ?? "💰"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{e.name}</p>
                <p className="text-xs text-gray-400">{e.budgetName}</p>
              </div>
              <span className="text-sm font-medium text-red-600 shrink-0">
                -${Number(e.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
