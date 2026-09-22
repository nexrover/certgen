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
  FiLayout,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiShare2,
  FiGift,
  FiCreditCard
} from "react-icons/fi";
import { FaCrown, FaYoutube, FaInstagram } from "react-icons/fa6";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { useSearch } from "@/lib/search-context";

interface DashboardSidebarProps {
  userEmail: string | undefined;
}

export function DashboardSidebar({}: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { searchQuery } = useSearch();
  const activeView = searchParams.get("view") ?? "dashboard";
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);
  // Define structured menu items
  const menuItems = [
    { label: t("sidebar.dashboard"), view: "dashboard", icon: HiOutlineSquares2X2 },
    { 
      label: t("sidebar.templates"), 
      view: "templates-group", 
      icon: FiLayout,
      children: [
        { label: t("sidebar.certificate"), view: "templates", icon: FiFileText },
        { label: t("sidebar.email"), view: "emails", icon: FiMail },
        { label: "YouTube Thumbnail", view: "youtube-thumbnail", icon: FaYoutube },
        { label: "E-commerce Marketing", view: "ecommerce", icon: FiShoppingBag },
        { label: "Real Estate Marketing", view: "real-estate", icon: FiHome },
        { label: "Shipping Label", view: "shipping-label", icon: FiPackage },
        { label: "Resume", view: "resume", icon: FiFileText },
        { label: "Christmas Card", view: "christmas-card", icon: FiGift },
        { label: "Social Media", view: "social-media", icon: FaInstagram },
        { label: "Receipt", view: "receipt", icon: FiCreditCard },
        { label: "Invoice", view: "invoice", icon: FiFileText },
      ]
    },
    { label: t("sidebar.recipients"), view: "csvs", icon: FiUsers },
    { label: t("sidebar.analysis"), view: "analysis", icon: FiBarChart2 },
    { label: t("sidebar.tutorial"), view: "tutorial", icon: FiBookOpen },
    { label: t("sidebar.setting"), view: "settings", icon: FiSettings },
  ];

  // Filtering Logic
  const query = searchQuery.toLowerCase().trim();
  
  const filteredItems = menuItems.filter(item => {
    // If no query, show everything
    if (!query) return true;

    // Check if main item matches
    const mainMatches = item.label.toLowerCase().includes(query);
    
    // Check if any children match
    const childMatches = item.children?.some(child => 
      child.label.toLowerCase().includes(query)
    );

    return mainMatches || childMatches;
  });

  // Highlight function
  const highlightMatch = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query 
            ? <span key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</span> 
            : part
        )}
      </span>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-sm overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <FiFileText className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">CertGen</span>
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
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;

              // If it has children (like Templates)
              if (item.children) {
                // If searching, keep the group open if a child matches
                const hasMatchingChild = query && item.children.some(c => c.label.toLowerCase().includes(query));
                const shouldBeOpen = isTemplatesOpen || hasMatchingChild;

                return (
                  <div key={item.view}>
                    <button
                      onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${
                        item.label.toLowerCase().includes(query) ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <span>{highlightMatch(item.label)}</span>
                      </div>
                      {shouldBeOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                    </button>

                    {shouldBeOpen && (
                      <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-50 pl-2">
                        {item.children
                          .filter(child => !query || child.label.toLowerCase().includes(query) || item.label.toLowerCase().includes(query))
                          .map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = activeView === child.view;
                            return (
                              <Link
                                key={child.view}
                                href={`/dashboard?view=${child.view}`}
                                className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                  isChildActive
                                    ? "bg-indigo-50/60 text-indigo-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <ChildIcon className="h-4 w-4" />
                                {highlightMatch(child.label)}
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple Item
              return (
                <Link
                  key={item.view}
                  href={`/dashboard?view=${item.view}`}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50/80 text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  } ${query && item.label.toLowerCase().includes(query) ? "ring-1 ring-indigo-100" : ""}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                  {highlightMatch(item.label)}
                </Link>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <FiSearch className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900">{t("common.no_results_found") || "No results found"}</p>
              <p className="text-xs text-gray-500 mt-1">Try searching for something else</p>
            </div>
          )}
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
