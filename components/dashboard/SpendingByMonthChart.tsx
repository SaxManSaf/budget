"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface MonthData {
  month: number;
  income: number;
  spent: number;
  goals?: number;
  savings: number;
  hasData: boolean;
}

export default function SpendingByMonthChart({ data }: { data: MonthData[] }) {
  const visible = data.filter((d) => d.hasData);
  const hasGoals = visible.some(d => (d.goals ?? 0) > 0);

  if (visible.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Spending by month</h3>
        <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet for this year</div>
      </div>
    );
  }

  const chartData = visible.map((d) => ({
    name: MONTH_SHORT[d.month - 1],
    Income: d.income,
    Spent: d.spent,
    ...(hasGoals ? { Goals: d.goals ?? 0 } : {}),
    Savings: d.savings,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Spending by month</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={36} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`}
            contentStyle={{ border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Income" fill="#e0e7ff" radius={[4,4,0,0]} />
          <Bar dataKey="Spent" fill="#6366f1" radius={[4,4,0,0]} />
          {hasGoals && <Bar dataKey="Goals" fill="#8b5cf6" radius={[4,4,0,0]} />}
          <Bar dataKey="Savings" fill="#34d399" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
