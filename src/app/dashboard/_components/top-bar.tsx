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
  LogOut 
} from "lucide-react";
import Image from "next/image";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter, useSearchParams } from "next/navigation";

export function TopBar() {
  const { userProfile, loading } = useUserProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
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
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-100">
              <div className="space-y-1">
                <button 
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button 
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleProfileClick}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button 
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Languages className="h-4 w-4" />
                  Language
                </button>
                <button 
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  Help
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button 
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
