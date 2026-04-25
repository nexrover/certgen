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
import { useTranslation } from "react-i18next";

interface DashboardSidebarProps {
  userEmail: string | undefined;
}

export function DashboardSidebar({}: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const activeView = searchParams.get("view") ?? "dashboard";
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);

  const navItems = [
    { label: t("sidebar.dashboard"), view: "dashboard", icon: HiOutlineSquares2X2 },
    { label: t("sidebar.recipients"), view: "csvs", icon: FiUsers },
    { label: t("sidebar.analysis"), view: "analysis", icon: FiBarChart2 },
    { label: t("sidebar.tutorial"), view: "tutorial", icon: FiBookOpen },
    { label: t("sidebar.setting"), view: "settings", icon: FiSettings },
  ] as const;

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
            placeholder={t("common.search_menu")}
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
          {t("sidebar.generate_certificate")}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto no-scrollbar">
        <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("common.main_menu")}</p>
        <nav className="space-y-1">
          {/* Dashboard Item */}
          <Link
            href="/dashboard?view=dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeView === "dashboard"
                ? "bg-indigo-50/80 text-indigo-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <HiOutlineSquares2X2 className={`h-5 w-5 ${activeView === "dashboard" ? "text-indigo-600" : "text-gray-400"}`} />
            {t("sidebar.dashboard")}
          </Link>

          {/* Collapsible Templates Item */}
          <div>
            <button
              onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center gap-3">
                <FiLayout className="h-5 w-5 text-gray-400" />
                <span>{t("sidebar.templates")}</span>
              </div>
              {isTemplatesOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </button>

            {isTemplatesOpen && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-50 pl-2">
                <Link
                  href="/dashboard?view=templates"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${activeView === "templates"
                      ? "bg-indigo-50/60 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <FiFileText className="h-4 w-4" />
                  {t("sidebar.certificate")}
                </Link>
                <Link
                  href="/dashboard?view=emails"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${activeView === "emails"
                      ? "bg-indigo-50/60 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <FiMail className="h-4 w-4" />
                  {t("sidebar.email")}
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
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
      <div className="px-4 py-4 mt-auto flex-shrink-0">
        <button className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 p-2.5 text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
              <FaCrown className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <p className="text-[13px] font-bold leading-tight">{t("sidebar.upgrade_to_pro")}</p>
              <p className="text-[10px] text-white/70 leading-tight mt-0.5">{t("sidebar.unlock_premium")}</p>
            </div>
          </div>
          <FiChevronRight className="relative z-10 h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
          
          {/* Subtle reflection effect */}
          <div className="absolute -left-[100%] top-0 h-full w-[100%] bg-linear-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 group-hover:left-[100%]" />
        </button>
      </div>
    </aside>
  );
}
