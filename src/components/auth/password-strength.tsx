"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface PasswordRequirementProps {
  label: string;
  met: boolean;
}

function RequirementItem({ label, met }: PasswordRequirementProps) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-all duration-300 ${met ? "text-green-600 font-medium" : "text-gray-400"}`}>
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 animate-in zoom-in duration-300" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-gray-300" />
      )}
      <span>{label}</span>
    </li>
  );
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasComplexity = /[0-9]|[^A-Za-z0-9]/.test(password);

  const requirements = [
    { label: "At least 8 characters", met: hasLength },
    { label: "At least one uppercase letter", met: hasUpper },
    { label: "At least one lowercase letter", met: hasLower },
    { label: "Number or special character", met: hasComplexity },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strengthPercent = (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (metCount === 0) return "bg-gray-200";
    if (metCount <= 2) return "bg-red-500";
    if (metCount === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (metCount === 0) return "";
    if (metCount <= 1) return "Very Weak";
    if (metCount === 2) return "Weak";
    if (metCount === 3) return "Fair";
    return "Strong";
  };

  return (
    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Password Strength</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${metCount === 4 ? "text-green-600" : "text-gray-500"}`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {requirements.map((req, i) => (
          <RequirementItem key={i} label={req.label} met={req.met} />
        ))}
      </ul>
    </div>
  );
}
