"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  ChevronDown, 
  User, 
  Zap, 
  Languages, 
  HelpCircle, 
  LogOut,
  Check,
  ChevronLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";

export function TopBar() {
  const { userProfile, loading } = useUserProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Bengali", code: "bn", flag: "🇧🇩" },
    { name: "Spanish", code: "es", flag: "🇪🇸" },
    { name: "French", code: "fr", flag: "🇫🇷" },
    { name: "German", code: "de", flag: "🇩🇪" },
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Arabic", code: "ar", flag: "🇸🇦" },
    { name: "Chinese", code: "zh", flag: "🇨🇳" },
    { name: "Japanese", code: "ja", flag: "🇯🇵" },
    { name: "Portuguese", code: "pt", flag: "🇵🇹" },
    { name: "Russian", code: "ru", flag: "🇷🇺" },
    { name: "Italian", code: "it", flag: "🇮🇹" },
    { name: "Korean", code: "ko", flag: "🇰🇷" },
    { name: "Turkish", code: "tr", flag: "🇹🇷" },
    { name: "Dutch", code: "nl", flag: "🇳🇱" },
    { name: "Vietnamese", code: "vi", flag: "🇻🇳" },
  ];

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsLanguageMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const displayName = userProfile?.name || "User Name";
  const firstLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "profile");
    router.push(`/dashboard?${params.toString()}`);
    setIsDropdownOpen(false);
  };

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call server-side signout to clear cookies
      await fetch("/api/auth/signout", { method: "POST" });
      
      // Call client-side signout to clear any local supabase state
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Clear local storage as requested
      localStorage.clear();
      
      // Redirect to Landing Page
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Search anything..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Sun className="h-5 w-5" />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="relative border-l border-gray-200 pl-4" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-100 flex items-center justify-center bg-indigo-50 shadow-sm">
              {loading ? (
                <div className="h-full w-full animate-pulse bg-gray-200" />
              ) : userProfile?.avatarUrl ? (
                <Image
                  src={userProfile.avatarUrl}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-indigo-600">{firstLetter}</span>
              )}
            </div>
            <div className="hidden text-left sm:block">
              {loading ? (
                <>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{displayName}</p>
                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-[11px] font-medium text-indigo-600 mt-1">Free Plan</p>
                </>
              )}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 flex gap-2 items-start pointer-events-none">
              {/* Main Profile Dropdown */}
              <div className="w-56 origin-top-right rounded-xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-100 pointer-events-auto">
                <div className="space-y-1">
                  <button 
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Zap className="h-4 w-4" />
                    {t('common.upgrade_plan')}
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button 
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    {t('common.profile')}
                  </button>
                  
                  {/* Language Selection with Nested Flyout */}
                  <div className="relative">
                    <button 
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isLanguageMenuOpen ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLanguageMenuOpen(!isLanguageMenuOpen);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Languages className="h-4 w-4" />
                        {t('common.language')}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {languages.find(l => l.code === i18n.language)?.name || 'English'}
                        <ChevronLeft className={`h-3 w-3 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Language Flyout - Positioned relative to the Language button */}
                    {isLanguageMenuOpen && (
                      <div className="absolute right-[calc(100%+8px)] top-0 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
                        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-50 mb-2">
                          <span className="text-sm font-semibold text-gray-900">Select Language</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLanguageMenuOpen(false);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4 text-gray-500 rotate-180" />
                          </button>
                        </div>
                        
                        <div className="relative px-2 mb-2">
                          <span className="absolute inset-y-0 left-5 flex items-center text-gray-400">
                            <Search className="h-3.5 w-3.5" />
                          </span>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-100 bg-gray-50 py-1.5 pl-8 pr-3 text-xs placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="Search language..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="max-h-[280px] overflow-y-auto px-1 space-y-0.5 custom-scrollbar">
                          {filteredLanguages.length > 0 ? (
                            filteredLanguages.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLanguageChange(lang.code);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                  i18n.language === lang.code 
                                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </div>
                                {i18n.language === lang.code && <Check className="h-4 w-4" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-6 text-center text-xs text-gray-400">
                              No languages found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    {t('common.help')}
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button 
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={initiateLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("common.logging_out")}</span>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t("common.logout_confirm_title")}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {t("common.logout_confirm_desc")}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm"
                >
                  {t("common.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
