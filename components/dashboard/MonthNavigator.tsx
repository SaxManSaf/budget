"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

interface Props {
  month: number;
  year: number;
}

export default function MonthNavigator({ month, year }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropYear, setDropYear] = useState(year);
  const ref = useRef<HTMLDivElement>(null);

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  function navigate(newMonth: number, newYear: number) {
    router.push(`${pathname}?month=${newMonth}&year=${newYear}`);
  }

  function prev() {
    if (month === 1) navigate(12, year - 1);
    else navigate(month - 1, year);
  }

  function next() {
    if (isCurrentMonth) return;
    if (month === 12) navigate(1, year + 1);
    else navigate(month + 1, year);
  }

  function selectMonth(m: number) {
    setOpen(false);
    navigate(m, dropYear);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keep dropYear in sync when closed
  useEffect(() => {
    if (!open) setDropYear(year);
  }, [open, year]);

  return (
    <div className="flex items-center gap-1" ref={ref}>
      {/* Prev arrow */}
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Dropdown trigger */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900 min-w-40 justify-between"
        >
          <span>{MONTH_NAMES[month - 1]} {year}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
            {/* Year selector inside dropdown */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <button
                onClick={() => setDropYear((y) => y - 1)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium text-gray-900">{dropYear}</span>
              <button
                onClick={() => setDropYear((y) => y + 1)}
                disabled={dropYear >= now.getFullYear()}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTH_NAMES.map((name, i) => {
                const m = i + 1;
                const isFuture = dropYear > now.getFullYear() ||
                  (dropYear === now.getFullYear() && m > now.getMonth() + 1);
                const isSelected = m === month && dropYear === year;
                return (
                  <button
                    key={m}
                    onClick={() => !isFuture && selectMonth(m)}
                    disabled={isFuture}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-center
                      ${isSelected ? "bg-indigo-600 text-white" : ""}
                      ${!isSelected && !isFuture ? "hover:bg-indigo-50 text-gray-700 hover:text-indigo-700" : ""}
                      ${isFuture ? "text-gray-300 cursor-not-allowed" : ""}
                    `}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Next arrow */}
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

