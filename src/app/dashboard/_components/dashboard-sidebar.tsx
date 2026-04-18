"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const navItems = [
  { label: "Templates", view: "templates" },
  { label: "CSVs", view: "csvs" },
  { label: "History", view: "history" },
] as const;

interface DashboardSidebarProps {
  userEmail: string | undefined;
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "templates";

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          NexRover CertGen
        </p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <Link
              key={item.view}
              href={`/dashboard?view=${item.view}`}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-gray-800">
            {userEmail ?? "Unknown user"}
          </p>
        </div>

        <button
          type="button"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
        >
          Profile
        </button>
        <form action="/auth/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
