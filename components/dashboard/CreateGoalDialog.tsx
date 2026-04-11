"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X } from "lucide-react";

const EMOJI_OPTIONS = ["✈️","🏠","🚗","💻","📱","🎓","💍","🏖️","⛵","🎸","🏋️","🌍","🎯","💰","🏡","🎁"];

export default function CreateGoalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthlyAllocation, setMonthlyAllocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-calculate monthly allocation when target amount and date are set
  function calcMonthly() {
    if (!targetAmount || !targetDate) return;
    const now = new Date();
    const target = new Date(targetDate);
    const months = Math.max(1,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
    );
    const monthly = (parseFloat(targetAmount) / months).toFixed(2);
    setMonthlyAllocation(monthly);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !targetAmount || !monthlyAllocation) return;
    setLoading(true);

    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        icon,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate || null,
        monthlyAllocation: parseFloat(monthlyAllocation),
      }),
    });

    setName(""); setIcon("🎯"); setTargetAmount("");
    setTargetDate(""); setMonthlyAllocation("");
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
        <Plus size={16} /> New goal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">New goal</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} type="button" onClick={() => setIcon(e)}
                      className={`text-xl p-1.5 rounded-lg transition-colors ${icon === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Goal name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Trip to Japan" required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Target amount ($)</label>
                <input type="number" value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  onBlur={calcMonthly}
                  placeholder="5000" min="1" step="0.01" required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Target date <span className="text-gray-400">(optional)</span></label>
                <input type="date" value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  onBlur={calcMonthly}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">Monthly contribution ($)</label>
                  {targetAmount && targetDate && (
                    <button type="button" onClick={calcMonthly}
                      className="text-xs text-indigo-500 hover:text-indigo-700">
                      Auto-calculate
                    </button>
                  )}
                </div>
                <input type="number" value={monthlyAllocation}
                  onChange={(e) => setMonthlyAllocation(e.target.value)}
                  placeholder="500" min="1" step="0.01" required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <p className="text-xs text-gray-400 mt-1">
                  How much you plan to put towards this goal each month.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Creating…" : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
