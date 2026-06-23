"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Package, BarChart3, Anchor } from "lucide-react";

const NAV = [
  { href: "/jobs",      label: "Jobs",      icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-slate-800">
        <Anchor className="w-5 h-5 text-sky-400 shrink-0" />
        <span className="text-white font-semibold text-sm leading-tight">
          Aegean Boatworks
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">Stavros A.</div>
            <div className="text-slate-500 text-xs">Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
