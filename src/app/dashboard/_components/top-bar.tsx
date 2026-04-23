"use client";

import { FiSearch, FiBell, FiSun } from "react-icons/fi";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface TopBarProps {
  user: User | null;
}

export function TopBar({ user }: TopBarProps) {
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User Name";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FiSearch className="h-4 w-4" />
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
          <FiSun className="h-5 w-5" />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <FiBell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-100">
            <Image
              src={avatarUrl}
              alt="User"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 leading-none">{userName}</p>
            <p className="text-[11px] text-gray-500 mt-1">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
