"use client";

import { FiPlusSquare, FiMail, FiUserPlus, FiLayout, FiChevronRight } from "react-icons/fi";
import Link from "next/link";

const actions = [
  {
    label: "Create New Certificate",
    description: "Design a new certificate",
    icon: FiPlusSquare,
    color: "text-indigo-600 bg-indigo-50",
    href: "/builder",
  },
  {
    label: "Send Email",
    description: "Send certificate via email",
    icon: FiMail,
    color: "text-blue-600 bg-blue-50",
    href: "/dashboard?view=emails",
  },
  {
    label: "Add Recipients",
    description: "Import or add recipients",
    icon: FiUserPlus,
    color: "text-purple-600 bg-purple-50",
    href: "/dashboard?view=csvs",
  },
  {
    label: "View Templates",
    description: "Browse certificate templates",
    icon: FiLayout,
    color: "text-orange-600 bg-orange-50",
    href: "/dashboard?view=templates",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-xl border border-gray-50 p-3 transition-all hover:border-indigo-100 hover:bg-indigo-50/50"
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">{action.label}</h4>
                <p className="text-[11px] text-gray-500">{action.description}</p>
              </div>
              <FiChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
