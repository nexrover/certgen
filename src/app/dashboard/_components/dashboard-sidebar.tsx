"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { 
  FiFileText, 
  FiMail, 
  FiUsers, 
  FiBarChart2, 
  FiBookOpen, 
  FiSettings,
  FiPlus,
  FiSearch,
  FiChevronRight,
  FiChevronDown,
  FiLayout
} from "react-icons/fi";
import { FaCrown } from "react-icons/fa6";
import { HiOutlineSquares2X2 } from "react-icons/hi2";

const navItems = [
  { label: "Dashboard", view: "dashboard", icon: HiOutlineSquares2X2 },
  { label: "Recipients", view: "csvs", icon: FiUsers },
  { label: "Analysis", view: "analysis", icon: FiBarChart2 },
  { label: "Tutorial", view: "tutorial", icon: FiBookOpen },
  { label: "Setting", view: "settings", icon: FiSettings },
] as const;

interface DashboardSidebarProps {
  userEmail: string | undefined;
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "dashboard";
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-sm overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <FiFileText className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">CertGen</span>
      </div>

      {/* Menu Search */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search menu..." 
            className="w-full rounded-lg bg-gray-50 py-2 pl-9 pr-3 text-xs border-none focus:ring-1 focus:ring-indigo-100 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-300">⌘F</kbd>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 mb-6 flex-shrink-0">
        <Link 
          href="/builder"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <FiPlus className="h-4 w-4" />
          Generate Certificate
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto no-scrollbar">
        <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Menu</p>
        <nav className="space-y-1">
          {/* Dashboard Item */}
          <Link
            href="/dashboard?view=dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeView === "dashboard"
                ? "bg-indigo-50/80 text-indigo-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <HiOutlineSquares2X2 className={`h-5 w-5 ${activeView === "dashboard" ? "text-indigo-600" : "text-gray-400"}`} />
            Dashboard
          </Link>

          {/* Collapsible Templates Item */}
          <div>
            <button
              onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center gap-3">
                <FiLayout className="h-5 w-5 text-gray-400" />
                <span>Templates</span>
              </div>
              {isTemplatesOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </button>
            
            {isTemplatesOpen && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-50 pl-2">
                <Link
                  href="/builder"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeView === "templates"
                      ? "bg-indigo-50/60 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <FiFileText className="h-4 w-4" />
                  Certificate
                </Link>
                <Link
                  href="/dashboard?view=emails"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeView === "emails"
                      ? "bg-indigo-50/60 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <FiMail className="h-4 w-4" />
                  Email
                </Link>
              </div>
            )}
          </div>

          {/* Other Items */}
          {navItems.filter(i => i.view !== 'dashboard').map((item) => {
            const isActive = activeView === item.view;
            const Icon = item.icon;
            return (
              <Link
                key={item.view}
                href={`/dashboard?view=${item.view}`}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Upgrade Banner */}
      <div className="p-4 mt-auto flex-shrink-0">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 p-4 text-white shadow-xl shadow-indigo-100">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                <FaCrown className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-indigo-100 mb-3 leading-relaxed">Unlock advanced analytics, custom branding, and more.</p>
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-medium text-white/80">Unlock premium features</span>
               <FiChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        </div>
      </div>
    </aside>
  );
}
