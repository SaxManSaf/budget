"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Budget { id: number; name: string; amount: string | number; totalSpent: number; icon: string | null; }
interface Expense { id: number; name: string; amount: string | number; date: string; budgetName: string; budgetIcon: string | null; createdAt: Date; }
interface CategorySpend { name: string; value: number; icon: string; }

interface Props {
  budgets: Budget[];
  categorySpend: CategorySpend[];
  recentExpenses: Expense[];
  totalSpent: number;
  totalBudget: number;
  goalsAmt: number;
  income: number;
}

const PIE_COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];
const INCOME_COLORS = ["#ef4444","#8b5cf6","#10b981"];

function fmt(n: number) {
  return `$${Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      {label && <p style={{ color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts({ budgets, categorySpend, recentExpenses, totalSpent, totalBudget, goalsAmt, income }: Props) {
  const barData = budgets.map((b) => ({
    name: b.name.length > 9 ? b.name.slice(0, 9) + "…" : b.name,
    Budget: Number(b.amount),
    Spent: Number(b.totalSpent),
  }));

  const remaining = Math.max(0, income - totalSpent - goalsAmt);
  const incomeBreakdown = income > 0 ? [
    ...(totalSpent > 0 ? [{ name: "Spent", value: totalSpent }] : []),
    ...(goalsAmt > 0 ? [{ name: "Goals", value: goalsAmt }] : []),
    ...(remaining > 0 ? [{ name: "Saved", value: remaining }] : []),
  ] : [];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900">Budget vs. spending</p>
          <p className="text-xs text-gray-400 mb-3">How much of each budget you&apos;ve used</p>
          {barData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No budgets this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Budget" fill="#e0e7ff" radius={[4,4,0,0]} />
                <Bar dataKey="Spent" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income donut */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900">Income breakdown</p>
          <p className="text-xs text-gray-400 mb-3">Where your money went this month</p>
          {incomeBreakdown.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-300 text-sm text-center gap-2">
              <span className="text-3xl">💰</span>
              Add income to see breakdown
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  paddingAngle={3} dataKey="value">
                  {incomeBreakdown.map((_, i) => <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent expenses - now on the left */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Recent expenses</p>
              <p className="text-xs text-gray-400">Latest transactions this month</p>
            </div>
            <a href="/expenses" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">View all →</a>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-gray-300 text-sm gap-2">
              <span className="text-2xl">🧾</span>
              No expenses yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{e.budgetIcon ?? "💰"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{e.name}</p>
                    <p className="text-xs text-gray-400">
                      {e.budgetName} · {new Date(e.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-red-500 shrink-0">-{fmt(Number(e.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending by budget donut - now on the right */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900">Spending by budget</p>
          <p className="text-xs text-gray-400 mb-3">Share of total spending per budget</p>
          {categorySpend.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-300 text-sm text-center gap-2">
              <span className="text-3xl">📊</span>
              No expenses logged yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categorySpend} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name">
                  {categorySpend.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
