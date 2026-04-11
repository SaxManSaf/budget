"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AddExpenseForm({ budgetId, userEmail }: { budgetId: number; userEmail: string }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || !date) return;
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount), budgetId, date }),
    });
    setName(""); setAmount(""); setDate(today);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Add expense</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grocery run" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" min="0.01" step="0.01" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Saving…" : "Add expense"}
        </button>
      </form>
    </div>
  );
}
