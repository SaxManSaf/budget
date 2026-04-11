"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Budget { id: number; name: string; icon: string | null; month: number; year: number; }

function MonthPicker({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropYear, setDropYear] = useState(year);
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { if (!open) setDropYear(year); }, [open, year]);

  function selectMonth(m: number) {
    setOpen(false);
    router.push(`/expenses/new?month=${m}&year=${dropYear}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 transition-colors">
        {MONTH_NAMES[month - 1]} {year}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-60">
          {/* Year row */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button type="button" onClick={() => setDropYear(y => y - 1)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-medium text-gray-900">{dropYear}</span>
            <button type="button" onClick={() => setDropYear(y => y + 1)}
              disabled={dropYear >= now.getFullYear()}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTH_SHORT.map((name, i) => {
              const m = i + 1;
              const isFuture = dropYear > now.getFullYear() || (dropYear === now.getFullYear() && m > now.getMonth() + 1);
              const isSelected = m === month && dropYear === year;
              return (
                <button key={m} type="button" onClick={() => !isFuture && selectMonth(m)} disabled={isFuture}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-center
                    ${isSelected ? "bg-indigo-600 text-white" : ""}
                    ${!isSelected && !isFuture ? "hover:bg-indigo-50 text-gray-700 hover:text-indigo-700" : ""}
                    ${isFuture ? "text-gray-300 cursor-not-allowed" : ""}
                  `}>
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddExpenseFormFull({ budgets, month, year }: { budgets: Budget[]; month: number; year: number }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetId, setBudgetId] = useState(budgets[0]?.id?.toString() ?? "");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || !budgetId || !date) return;
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount), budgetId: parseInt(budgetId), date }),
    });
    setLoading(false);
    router.push("/expenses");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 w-full max-w-lg mx-auto">
      {/* Month context row */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
        <span className="text-sm text-gray-500">
          Budgets for <span className="font-medium text-gray-900">{MONTH_NAMES[month - 1]} {year}</span>
        </span>
        <MonthPicker month={month} year={year} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grocery run" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" min="0.01" step="0.01" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Budget</label>
          {budgets.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2.5 rounded-lg">
              No budgets for {MONTH_NAMES[month - 1]} {year}. Create one first or pick a different month above.
            </p>
          ) : (
            <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent">
              {budgets.map((b) => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading || budgets.length === 0}
            className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Saving…" : "Save expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
