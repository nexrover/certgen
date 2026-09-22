"use client";

import { useTranslation } from "react-i18next";
import { FiChevronDown } from "react-icons/fi";

export function CertificateChart() {
  const { t } = useTranslation();
  
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900">{t("dashboard.analytics.title")}</h3>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          {t("dashboard.analytics.this_week", "This Week")}
          <FiChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative h-64 w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-[10px] font-medium text-gray-400">
          <span>600</span>
          <span>400</span>
          <span>200</span>
          <span className="mb-6">0</span>
        </div>

        {/* Grid lines */}
        <div className="ml-8 flex h-full flex-col justify-between pb-6">
          <div className="border-b border-gray-50 w-full"></div>
          <div className="border-b border-gray-50 w-full"></div>
          <div className="border-b border-gray-50 w-full"></div>
          <div className="border-b border-gray-100 w-full"></div>
        </div>

        {/* The Chart (SVG) */}
        <div className="absolute inset-0 ml-8 mb-6">
          <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area */}
            <path
              d="M0,160 C50,140 80,180 120,120 C160,60 200,100 240,140 C280,180 320,100 360,60 C400,20 440,50 480,30 L480,200 L0,200 Z"
              fill="url(#chartGradient)"
              className="w-full"
            />
            
            {/* Line */}
            <path
              d="M0,160 C50,140 80,180 120,120 C160,60 200,100 240,140 C280,180 320,100 360,60 C400,20 440,50 480,30"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full"
            />
            
            {/* Dots */}
            <circle cx="0" cy="160" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="120" cy="120" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="240" cy="140" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="360" cy="60" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="480" cy="30" r="6" fill="#4f46e5" />
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-medium text-gray-400">
          <span>May 18</span>
          <span>May 19</span>
          <span>May 20</span>
          <span>May 21</span>
          <span>May 22</span>
          <span>May 23</span>
          <span>May 24</span>
        </div>
      </div>
    </div>
  );
}
