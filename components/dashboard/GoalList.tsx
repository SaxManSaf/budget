"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Check, X, Pencil, ChevronDown, ChevronUp } from "lucide-react";

interface GoalWithStats {
  id: number;
  name: string;
  icon: string | null;
  targetAmount: string | number;
  targetDate: string | null;
  monthlyAllocation: string | number;
  totalSaved: number;
}

interface Contribution {
  id: number;
  goalId: number;
  amount: string | number;
  month: number;
  year: number;
  note: string | null;
  createdAt: Date;
}

const EMOJI_OPTIONS = ["✈️","🏠","🚗","💻","📱","🎓","💍","🏖️","⛵","🎸","🏋️","🌍","🎯","💰","🏡","🎁"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n: number) {
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
}

function EditGoalModal({ goal, onClose }: { goal: GoalWithStats; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(goal.name);
  const [icon, setIcon] = useState(goal.icon ?? "🎯");
  const [targetAmount, setTargetAmount] = useState(String(Number(goal.targetAmount)));
  const [targetDate, setTargetDate] = useState(goal.targetDate ?? "");
  const [monthlyAllocation, setMonthlyAllocation] = useState(String(Number(goal.monthlyAllocation)));
  const [loading, setLoading] = useState(false);

  function calcMonthly() {
    if (!targetAmount || !targetDate) return;
    const now = new Date();
    const target = new Date(targetDate);
    const months = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
    const remaining = Math.max(0, parseFloat(targetAmount) - Number(goal.totalSaved));
    setMonthlyAllocation((remaining / months).toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/goals?id=${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, targetAmount: parseFloat(targetAmount), targetDate: targetDate || null, monthlyAllocation: parseFloat(monthlyAllocation) }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Edit goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} type="button" onClick={() => setIcon(e)}
                  className={`text-xl p-1.5 rounded-lg ${icon === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Goal name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target amount ($)</label>
            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} onBlur={calcMonthly} min="1" step="0.01" required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target date <span className="text-gray-400">(optional)</span></label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} onBlur={calcMonthly}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Monthly contribution ($)</label>
              {targetAmount && targetDate && (
                <button type="button" onClick={calcMonthly} className="text-xs text-indigo-500 hover:text-indigo-700">Recalculate</button>
              )}
            </div>
            <input type="number" value={monthlyAllocation} onChange={(e) => setMonthlyAllocation(e.target.value)} min="1" step="0.01" required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <p className="text-xs text-gray-400 mt-1">Already saved: {fmt(Number(goal.totalSaved))}</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditContributionModal({ contribution, onClose }: { contribution: Contribution; onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(Number(contribution.amount)));
  const [note, setNote] = useState(contribution.note ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/goals/contributions?id=${contribution.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), note: note || null }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Edit contribution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bonus from work"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoalCard({ goal, contributions }: { goal: GoalWithStats; contributions: Contribution[] }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showContrib, setShowContrib] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editContrib, setEditContrib] = useState<Contribution | null>(null);
  const [deletingContribId, setDeletingContribId] = useState<number | null>(null);
  const [contribAmount, setContribAmount] = useState(String(Number(goal.monthlyAllocation)));
  const [contribNote, setContribNote] = useState("");
  const [saving, setSaving] = useState(false);

  const target = Number(goal.targetAmount);
  const saved = Number(goal.totalSaved);
  const monthly = Number(goal.monthlyAllocation);
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : null;
  const isComplete = saved >= target;
  const myContribs = contributions.filter(c => c.goalId === goal.id);

  function getStatus() {
    if (!goal.targetDate || isComplete) return null;
    const now = new Date();
    const tgt = new Date(goal.targetDate);
    const available = Math.max(0, (tgt.getFullYear() - now.getFullYear()) * 12 + (tgt.getMonth() - now.getMonth()));
    if (monthsLeft === null) return null;
    if (monthsLeft <= available) return { ok: true, label: "On track" };
    return { ok: false, label: `${monthsLeft - available}mo behind` };
  }

  const status = getStatus();

  async function logContrib() {
    if (!contribAmount) return;
    setSaving(true);
    const now = new Date();
    await fetch("/api/goals/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: goal.id, amount: parseFloat(contribAmount), month: now.getMonth() + 1, year: now.getFullYear(), note: contribNote || null }),
    });
    setSaving(false);
    setShowContrib(false);
    setContribNote("");
    setContribAmount(String(monthly));
    router.refresh();
  }

  async function deleteContrib(id: number) {
    setDeletingContribId(id);
    await fetch(`/api/goals/contributions?id=${id}`, { method: "DELETE" });
    setDeletingContribId(null);
    router.refresh();
  }

  async function deleteGoal() {
    setDeleting(true);
    await fetch(`/api/goals?id=${goal.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      {showEdit && <EditGoalModal goal={goal} onClose={() => setShowEdit(false)} />}
      {editContrib && <EditContributionModal contribution={editContrib} onClose={() => setEditContrib(null)} />}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Coloured top strip */}
        <div className={`h-1.5 ${isComplete ? "bg-green-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl">{goal.icon ?? "🎯"}</span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{goal.name}</p>
                {goal.targetDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    By {new Date(goal.targetDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {status && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {status.label}
                </span>
              )}
              {isComplete && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">🎉 Complete!</span>}
              <button onClick={() => setShowEdit(true)} className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors" title="Edit">
                <Pencil size={14} />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Delete?</span>
                  <button onClick={deleteGoal} disabled={deleting} className="text-xs font-medium text-red-600">{deleting ? "…" : "Yes"}</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500">No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-gray-900">{fmt(saved)}</span>
              <span className="text-gray-400">of {fmt(target)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-gradient-to-r from-indigo-400 to-indigo-600"}`}
                style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{pct}% saved</span>
              <span>{fmt(remaining)} remaining</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Monthly", value: fmt(monthly) },
              { label: "Remaining", value: fmt(remaining) },
              { label: isComplete ? "Done!" : monthsLeft ? `${monthsLeft} months` : "—", value: isComplete ? "🎉" : "to go" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Log contribution */}
          {!isComplete && (
            showContrib ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-indigo-700">Log contribution for {new Date().toLocaleString("en-AU", { month: "long" })}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
                    <input type="number" value={contribAmount} onChange={(e) => setContribAmount(e.target.value)}
                      min="0.01" step="0.01" placeholder="Amount"
                      className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
                    <input type="text" value={contribNote} onChange={(e) => setContribNote(e.target.value)}
                      placeholder="e.g. Bonus"
                      className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={logContrib} disabled={saving}
                    className="flex-1 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-1">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {saving ? "Saving…" : "Confirm contribution"}
                  </button>
                  <button onClick={() => setShowContrib(false)} className="px-3 py-2 border border-gray-200 bg-white text-gray-500 text-xs rounded-lg">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowContrib(true)}
                className="w-full py-2.5 border border-dashed border-indigo-300 text-indigo-600 text-sm font-medium rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Log contribution
              </button>
            )
          )}

          {/* Contribution history */}
          {myContribs.length > 0 && (
            <div>
              <button onClick={() => setShowHistory(h => !h)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium w-full">
                {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {myContribs.length} contribution{myContribs.length !== 1 ? "s" : ""} · {fmt(myContribs.reduce((s, c) => s + Number(c.amount), 0))} total
              </button>

              {showHistory && (
                <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                  {myContribs.map((c, i) => (
                    <div key={c.id} className={`flex items-center gap-3 px-3 py-2.5 ${i < myContribs.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-600">+{fmt(Number(c.amount))}</p>
                        <p className="text-xs text-gray-400">
                          {MONTH_NAMES[c.month - 1]} {c.year}{c.note ? ` · ${c.note}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditContrib(c)} className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => deleteContrib(c.id)} disabled={deletingContribId === c.id}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40">
                          {deletingContribId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function GoalList({ goals, contributions }: { goals: GoalWithStats[]; contributions: Contribution[] }) {
  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-gray-600 font-medium">No goals yet</p>
        <p className="text-gray-400 text-sm mt-1">Create a goal to start working towards something.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((g) => <GoalCard key={g.id} goal={g} contributions={contributions} />)}
    </div>
  );
}
