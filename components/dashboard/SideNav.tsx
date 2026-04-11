"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, PiggyBank, ReceiptText, CircleDollarSign,
  PlusCircle, TrendingUp, RefreshCw, Banknote, Menu, X, Target,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Income", href: "/income", icon: Banknote },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Add expense", href: "/expenses/new", icon: PlusCircle },
  { label: "Recurring", href: "/recurring", icon: RefreshCw },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Savings", href: "/savings", icon: TrendingUp },
];

// Bottom nav shows only the 5 most important items on mobile
const bottomNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Add", href: "/expenses/new", icon: PlusCircle },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Savings", href: "/savings", icon: TrendingUp },
];

export default function SideNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 bg-white border-r border-gray-100 flex-col h-full shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <CircleDollarSign className="text-indigo-600" size={22} />
            <span className="text-base font-semibold text-gray-900">Spendwise</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-gray-500">Account</span>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <CircleDollarSign className="text-indigo-600" size={20} />
          <span className="text-base font-semibold text-gray-900">Spendwise</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton  />
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                      active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />{label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-center safe-area-pb">
        {bottomNavItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isAdd = href === "/expenses/new";
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isAdd
                  ? "text-indigo-600"
                  : active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {isAdd ? (
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center -mt-5 shadow-lg">
                  <Icon size={20} className="text-white" />
                </div>
              ) : (
                <Icon size={20} />
              )}
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
