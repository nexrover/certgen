"use client";

import { useTranslation } from "react-i18next";
import { FiFileText, FiUsers, FiSend, FiPieChart, FiArrowUpRight } from "react-icons/fi";

interface StatsCardsProps {
  templateCount: number;
  certificateCount: number;
}

export function StatsCards({ templateCount, certificateCount }: StatsCardsProps) {
  const { t } = useTranslation();
  
  const stats = [
    {
      label: t("dashboard.stats.certificates_generated"),
      value: certificateCount.toLocaleString(),
      change: "12.5%",
      trend: "up",
      icon: FiFileText,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: t("dashboard.stats.templates_created"),
      value: templateCount.toLocaleString(),
      change: "8.3%",
      trend: "up",
      icon: FiUsers,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: t("dashboard.stats.emails_sent"),
      value: "0",
      change: "0%",
      trend: "up",
      icon: FiSend,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: t("dashboard.stats.avg_open_rate"),
      value: "0%",
      change: "0%",
      trend: "up",
      icon: FiPieChart,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <div className="flex items-center text-xs font-semibold text-emerald-600">
                <FiArrowUpRight className="mr-0.5 h-3 w-3" />
                {stat.change}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">{t("dashboard.stats.from_last_week")}</p>
          </div>
        );
      })}
    </div>
  );
}
