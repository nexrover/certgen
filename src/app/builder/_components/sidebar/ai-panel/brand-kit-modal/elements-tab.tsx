"use client";

import { LuUpload, LuSticker } from "react-icons/lu";

export function ElementsTab() {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Elements</h3>
      <div className="grid grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
          <LuUpload className="w-8 h-8 mb-3" />
          <span className="text-sm font-semibold">Upload New</span>
        </div>
        {/* Mock Assets */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden"
          >
            <LuSticker className="w-10 h-10 text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
