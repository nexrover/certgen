"use client";

import { LuShapes } from "react-icons/lu";

export function GraphicsTab() {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Graphics</h3>
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 border border-gray-200 shadow-sm flex items-center justify-center group overflow-hidden relative cursor-pointer"
          >
            <LuShapes className="w-10 h-10 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Select</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
