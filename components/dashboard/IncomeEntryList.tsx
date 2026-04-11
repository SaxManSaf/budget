"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Entry { id: number; name: string; amount: string | number; source: string | null; date: string; }

const SOURCE_STYLES: Record<string, string> = {
  salary: "bg-indigo-50 text-indigo-700", overtime: "bg-blue-50 text-blue-700",
  freelance: "bg-purple-50 text-purple-700", sale: "bg-green-50 text-green-700",
  transfer: "bg-teal-50 text-teal-700", gift: "bg-pink-50 text-pink-700",
  investment: "bg-amber-50 text-amber-700", other: "bg-gray-100 text-gray-600",
};

function SourceBadge({ source }: { source: string | null }) {
  const key = source?.toLowerCase() ?? "other";
  const style = SOURCE_STYLES[key] ?? SOURCE_STYLES.other;
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>{source ?? "other"}</span>;
}

export default function IncomeEntryList({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function deleteEntry(id: number) {
    setDeletingId(id);
    await fetch(`/api/income?id=${id}`, { method: "DELETE" });
    setDeletingId(null); setConfirmId(null);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">No income logged yet.</p>
        <p className="text-gray-400 text-xs mt-1">Add your salary, overtime, sales, and more.</p>
      </div>
    );
  }

  const total = entries.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[130px] truncate">{e.name}</td>
                <td className="px-4 py-3"><SourceBadge source={e.source} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(e.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-600 whitespace-nowrap">
                  +${Number(e.amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right">
                  {confirmId === e.id ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs text-gray-500">Delete?</span>
                      <button onClick={() => deleteEntry(e.id)} disabled={deletingId === e.id} className="text-xs font-medium text-red-600">
                        {deletingId === e.id ? "…" : "Yes"}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-gray-500">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(e.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-xs font-medium text-gray-500">Total income</td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 whitespace-nowrap">
                +${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
