import BudgetCard from "./BudgetCard";

interface BudgetWithStats {
  id: number;
  name: string;
  amount: string | number;
  icon: string | null;
  isFavourite: boolean;
  totalSpent: number;
  totalItems: number;
}

export default function BudgetList({ budgets }: { budgets: BudgetWithStats[] }) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">No budgets yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
      {budgets.map((b) => (
        <BudgetCard key={b.id} budget={b} />
      ))}
    </div>
  );
}
