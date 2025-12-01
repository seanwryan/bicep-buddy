"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Activity, Users } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/plan", label: "Plan", icon: Calendar },
  { href: "/session", label: "Session", icon: Activity },
  { href: "/cohort", label: "Cohort", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show nav on onboarding
  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t-2 border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all",
                isActive
                  ? "text-blue-500"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
