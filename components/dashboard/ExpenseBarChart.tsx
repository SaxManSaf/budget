"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BudgetWithStats {
  id: number;
  name: string;
  amount: string | number;
  totalSpent: number;
}

export default function ExpenseBarChart({ budgets }: { budgets: BudgetWithStats[] }) {
  const data = budgets.map((b) => ({
    name: b.name.length > 8 ? b.name.slice(0, 8) + "…" : b.name,
    Budget: Number(b.amount),
    Spent: Number(b.totalSpent),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Budget vs. spending</h3>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={36} />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`}
              contentStyle={{ border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="Budget" fill="#e0e7ff" radius={[4,4,0,0]} />
            <Bar dataKey="Spent" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
