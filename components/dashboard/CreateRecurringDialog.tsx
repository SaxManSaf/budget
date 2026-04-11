"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X } from "lucide-react";

const EMOJI_OPTIONS = ["🏠","🚗","🐱","🐶","💊","📱","🎬","💡","🌊","🏋️","📚","✈️","💳","🔒","📡","🎵"];
const CATEGORIES = ["Housing","Transport","Insurance","Subscriptions","Utilities","Health","Other"];

export default function CreateRecurringDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("💳");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    setLoading(true);

    await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount), icon, category }),
    });

    setName("");
    setAmount("");
    setIcon("💳");
    setCategory("Other");
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus size={16} />
        Add payment
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Add recurring payment</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`text-xl p-1.5 rounded-lg transition-colors ${
                        icon === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Car insurance"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Monthly amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Saving…" : "Add payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
