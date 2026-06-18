"use client";

import { LuUpload } from "react-icons/lu";

export function LogoTab() {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Logos</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg p-12 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/40 transition-colors">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-5">
            <LuUpload className="w-10 h-10 text-indigo-500" />
          </div>
          <h4 className="text-base font-bold text-gray-700 mb-2">Drag & Drop your logos here</h4>
          <p className="text-sm text-gray-500 mb-6">Supports SVG, PNG, JPG (Max 5MB)</p>
          <button className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}
