"use client";
import { FiClock, FiMail, FiShoppingBag, FiHome, FiPackage, FiShare2, FiGift, FiCreditCard, FiFileText } from "react-icons/fi";
import { FaYoutube, FaInstagram } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  view?: string;
}

export function ComingSoon({ 
  title = "Coming Soon", 
  subtitle = "This feature is under development.",
  icon,
  view
}: ComingSoonProps) {
  const { t } = useTranslation();

  // Resolve icon if view is provided
  let displayIcon = icon;
  if (view && !icon) {
    switch (view) {
      case "emails": displayIcon = <FiMail className="h-12 w-12" />; break;
      case "youtube-thumbnail": displayIcon = <FaYoutube className="h-12 w-12" />; break;
      case "ecommerce": displayIcon = <FiShoppingBag className="h-12 w-12" />; break;
      case "real-estate": displayIcon = <FiHome className="h-12 w-12" />; break;
      case "shipping-label": displayIcon = <FiPackage className="h-12 w-12" />; break;
      case "resume": displayIcon = <FiFileText className="h-12 w-12" />; break;
      case "christmas-card": displayIcon = <FiGift className="h-12 w-12" />; break;
      case "social-media": displayIcon = <FaInstagram className="h-12 w-12" />; break;
      case "receipt": displayIcon = <FiCreditCard className="h-12 w-12" />; break;
      case "invoice": displayIcon = <FiFileText className="h-12 w-12" />; break;
    }
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm">
        {displayIcon || <FiClock className="h-12 w-12" />}
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
        {title !== "Coming Soon" ? title : t("common.coming_soon")}
      </h2>
      <p className="mt-3 max-w-md text-base font-medium text-gray-500">
        {subtitle !== "This feature is under development." ? subtitle : t("common.coming_soon_desc")}
      </p>
      <div className="mt-8">
        <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]">
          {t("common.notify_me") || "Notify Me"}
        </button>
      </div>
    </div>
  );
}
