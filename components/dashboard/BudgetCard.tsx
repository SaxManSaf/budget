"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Star } from "lucide-react";
import { useState } from "react";

interface BudgetWithStats {
  id: number;
  name: string;
  amount: string | number;
  icon: string | null;
  isFavourite: boolean;
  totalSpent: number;
  totalItems: number;
}

export default function BudgetCard({ budget }: { budget: BudgetWithStats }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favourite, setFavourite] = useState(budget.isFavourite);
  const [togglingFav, setTogglingFav] = useState(false);

  const spent = Number(budget.totalSpent);
  const limit = Number(budget.amount);
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const barColor = pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-indigo-500";

  async function toggleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTogglingFav(true);
    const next = !favourite;
    setFavourite(next);
    await fetch(`/api/budgets?id=${budget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavourite: next }),
    });
    setTogglingFav(false);
    router.refresh();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await fetch(`/api/budgets?id=${budget.id}`, { method: "DELETE" });
    router.refresh();
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  }

  return (
    <Link href={`/budgets/${budget.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer relative">

        {/* Top-right controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {/* Star */}
          <button
            onClick={toggleFavourite}
            disabled={togglingFav}
            title={favourite ? "Remove from favourites" : "Add to favourites"}
            className={`p-1.5 rounded-lg transition-colors ${
              favourite
                ? "text-amber-400 hover:text-amber-500"
                : "opacity-0 group-hover:opacity-100 text-gray-300 hover:text-amber-400"
            }`}
          >
            <Star size={14} fill={favourite ? "currentColor" : "none"} />
          </button>

          {/* Delete */}
          {confirmDelete ? (
            <div
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-xs text-gray-500">Delete?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
                {deleting ? "…" : "Yes"}
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={handleCancelDelete} className="text-xs font-medium text-gray-500 hover:text-gray-700">No</button>
            </div>
          ) : (
            <button onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Card content */}
        <div className="flex items-center gap-2.5 mb-3 pr-16">
          <span className="text-2xl">{budget.icon ?? "💰"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{budget.name}</p>
            <p className="text-xs text-gray-400">{budget.totalItems} items</p>
          </div>
          <span className="text-sm font-semibold text-gray-900 shrink-0">
            ${Number(budget.amount).toLocaleString()}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>${spent.toLocaleString()} spent</span>
            <span>${(limit - spent).toLocaleString()} left</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
