"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const SOURCES = ["Salary","Overtime","Freelance","Sale","Transfer","Gift","Investment","Other"];

export default function AddIncomeForm({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || !date) return;
    setLoading(true);
    await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount), source, month, year, date }),
    });
    setName(""); setAmount(""); setDate(today);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Log income</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. April salary" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" min="0.01" step="0.01" required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date received</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Saving…" : "Add income"}
        </button>
      </form>
    </div>
  );
}
