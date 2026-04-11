"use client";

import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { useState } from "react";

interface Expense {
  id: number;
  name: string;
  amount: string | number;
  createdAt: Date;
  budgetName?: string;
  budgetIcon?: string | null;
  date?: string;
}

function EditRow({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(Number(expense.amount)));
  const [date, setDate] = useState(expense.date ?? new Date(expense.createdAt).toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/expenses?id=${expense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount), date }),
    });
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <tr className="border-b border-indigo-50 bg-indigo-50/40">
      <td className="px-3 py-2">
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </td>
      <td className="px-3 py-2" colSpan={expense.budgetName ? 1 : 0} />
      <td className="px-3 py-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </td>
      <td className="px-3 py-2 text-right">
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01"
          className="w-24 px-2 py-1 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-right" />
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={save} disabled={saving} className="p-1.5 text-green-600 hover:text-green-700 disabled:opacity-50">
            <Check size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ExpenseTable({ expenses, showBudget = false }: { expenses: Expense[]; showBudget?: boolean }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function deleteExpense(id: number) {
    setDeletingId(id);
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmDeleteId(null);
    router.refresh();
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
        <p className="text-gray-400 text-sm">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
              {showBudget && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Budget</th>}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              editingId === e.id ? (
                <EditRow key={e.id} expense={e} onClose={() => setEditingId(null)} />
              ) : (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate">{e.name}</td>
                  {showBudget && (
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{e.budgetIcon} {e.budgetName}</td>
                  )}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(e.date ?? e.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-500 whitespace-nowrap">
                    -${Number(e.amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === e.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-gray-500">Delete?</span>
                        <button onClick={() => deleteExpense(e.id)} disabled={deletingId === e.id}
                          className="text-xs font-medium text-red-600">{deletingId === e.id ? "…" : "Yes"}</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(e.id)} className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmDeleteId(e.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
