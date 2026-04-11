import { PiggyBank, Wallet, TrendingDown, TrendingUp, Target } from "lucide-react";

interface Props {
  totalBudget: number;
  totalSpent: number;
  totalBudgets: number;
  income: number;
  savings: number;
  goalsAmt?: number;
}

export default function StatsCards({ totalBudget, totalSpent, totalBudgets, income, savings, goalsAmt = 0 }: Props) {
  function fmt(n: number) {
    return `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
  }

  const cards = [
    { label: "Monthly income", value: income > 0 ? fmt(income) : "Not set", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
    { label: "Total spent", value: fmt(totalSpent), icon: TrendingDown, color: "text-red-600 bg-red-50" },
    ...(goalsAmt > 0 ? [{ label: "Goals this month", value: fmt(goalsAmt), icon: Target, color: "text-purple-600 bg-purple-50" }] : [
      { label: "Total budgeted", value: fmt(totalBudget), icon: PiggyBank, color: "text-blue-600 bg-blue-50" }
    ]),
    {
      label: income > 0 ? "Net saved" : "Budget remaining",
      value: income > 0 ? (savings < 0 ? `-${fmt(savings)}` : fmt(savings)) : fmt(totalBudget - totalSpent),
      icon: Wallet,
      color: (income > 0 ? savings : totalBudget - totalSpent) >= 0 ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4 flex items-center gap-3">
          <div className={`p-2 lg:p-2.5 rounded-lg shrink-0 ${color}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5 truncate">{label}</p>
            <p className="text-base lg:text-lg font-semibold text-gray-900 truncate">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
