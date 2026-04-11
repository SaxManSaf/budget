"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  month: number;
  year: number;
  currentIncome: number;
}

export default function IncomeInput({ month, year, currentIncome }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentIncome > 0 ? String(currentIncome) : "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!value || isNaN(parseFloat(value))) return;
    setSaving(true);
    await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(value), month, year }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Income:</span>
        <div className="flex items-center gap-1 bg-white border border-indigo-300 rounded-lg px-2 py-1">
          <span className="text-sm text-gray-400">$</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 text-sm outline-none"
            placeholder="0.00"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
        </div>
        <button onClick={save} disabled={saving} className="p-1 text-green-600 hover:text-green-700">
          <Check size={16} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        Income:{" "}
        <span className="font-medium text-gray-900">
          {currentIncome > 0
            ? `$${currentIncome.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`
            : "not set"}
        </span>
      </span>
      <button
        onClick={() => setEditing(true)}
        className="p-1 text-gray-300 hover:text-indigo-500 transition-colors"
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}
