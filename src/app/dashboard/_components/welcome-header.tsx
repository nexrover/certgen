"use client";

import { useTranslation } from "react-i18next";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import { useUserProfileContext } from "@/lib/user-profile-context";
 
 interface WelcomeHeaderProps {
   userName: string;
 }
 
 export function WelcomeHeader({ userName: initialUserName }: WelcomeHeaderProps) {
   const { t } = useTranslation();
   const { userProfile } = useUserProfileContext();
   
   const userName = userProfile?.firstName || userProfile?.name?.split(' ')[0] || initialUserName || 'User';
 
   return (
     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
       <div>
         <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t("dashboard.title")}</h1>
         <p className="mt-1.5 text-sm font-medium text-gray-500">
           {t("dashboard.welcome")}, {userName}! {t("dashboard.subtitle", "Here's what's happening with your certificates.")}
         </p>
       </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50">
          <FiCalendar className="h-4 w-4 text-gray-400" />
          May 18 - May 24, 2024
          <FiChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
