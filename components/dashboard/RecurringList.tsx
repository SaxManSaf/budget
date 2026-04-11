"use client";

import { useRouter } from "next/navigation";
import { Trash2, PlusCircle, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface Payment { id: number; name: string; amount: string | number; icon: string | null; category: string | null; }
interface Budget { id: number; name: string; icon: string | null; }
interface Props { payments: Payment[]; budgets: Budget[]; month: number; year: number; monthName: string; }

const CATEGORY_STYLES: Record<string, string> = {
  housing: "bg-blue-50 text-blue-700", transport: "bg-green-50 text-green-700",
  insurance: "bg-purple-50 text-purple-700", subscriptions: "bg-amber-50 text-amber-700",
  utilities: "bg-teal-50 text-teal-700", health: "bg-red-50 text-red-700", other: "bg-gray-100 text-gray-600",
};

function CategoryBadge({ category }: { category: string | null }) {
  const key = category?.toLowerCase() ?? "other";
  const style = CATEGORY_STYLES[key] ?? CATEGORY_STYLES.other;
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>{category ?? "other"}</span>;
}

export default function RecurringList({ payments, budgets, month, year, monthName }: Props) {
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [logId, setLogId] = useState<number | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(budgets[0]?.id?.toString() ?? "");
  const [loggingId, setLoggingId] = useState<number | null>(null);
  const [loggedIds, setLoggedIds] = useState<Set<number>>(new Set());

  async function deletePayment(id: number) {
    setDeletingId(id);
    await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    setDeletingId(null); setConfirmDeleteId(null);
    router.refresh();
  }

  async function logExpense(payment: Payment) {
    if (!selectedBudgetId) return;
    setLoggingId(payment.id);
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: payment.name, amount: Number(payment.amount), budgetId: parseInt(selectedBudgetId), date: today }),
    });
    setLoggingId(null); setLogId(null);
    setLoggedIds((prev) => new Set(prev).add(payment.id));
    router.refresh();
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
        <p className="text-gray-400 text-sm">No recurring payments yet.</p>
        <p className="text-gray-400 text-xs mt-1">Add things like rent, insurance, subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          No budgets for {monthName} {year}. Create one before logging expenses.
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Monthly</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 min-w-40">Log to {monthName}</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const alreadyLogged = loggedIds.has(p.id);
                const isLogging = logId === p.id;
                return (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon ?? "💳"}</span>
                        <span className="font-medium text-gray-900 truncate max-w-[120px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><CategoryBadge category={p.category} /></td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      ${Number(p.amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {alreadyLogged ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={12} /> Logged</span>
                      ) : isLogging ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <select value={selectedBudgetId} onChange={(e) => setSelectedBudgetId(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                            {budgets.map((b) => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                          </select>
                          <button onClick={() => logExpense(p)} disabled={loggingId === p.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                            {loggingId === p.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Confirm
                          </button>
                          <button onClick={() => setLogId(null)} className="p-1 text-gray-400"><X size={13} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setLogId(p.id); setSelectedBudgetId(budgets[0]?.id?.toString() ?? ""); }}
                          disabled={budgets.length === 0}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 disabled:opacity-40">
                          <PlusCircle size={11} /> Add to {monthName}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-gray-500">Delete?</span>
                          <button onClick={() => deletePayment(p.id)} disabled={deletingId === p.id} className="text-xs font-medium text-red-600">{deletingId === p.id ? "…" : "Yes"}</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(p.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500">Total</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                  ${payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
