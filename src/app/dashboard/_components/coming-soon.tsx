import { FiMail, FiClock } from "react-icons/fi";
import { IconType } from "react-icons";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  icon?: IconType;
}

export function ComingSoon({ 
  title = "Coming Soon", 
  subtitle = "This feature is under development.",
  icon: Icon = FiClock
}: ComingSoonProps) {
  return (
    <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm">
        <Icon className="h-12 w-12" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2>
      <p className="mt-3 max-w-md text-base font-medium text-gray-500">
        {subtitle}
      </p>
      <div className="mt-8">
        <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]">
          Notify Me
        </button>
      </div>
    </div>
  );
}
