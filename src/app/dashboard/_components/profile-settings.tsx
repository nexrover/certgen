"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import {
  User,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Save,
  AlertCircle,
  Phone,
  Plus,
  Upload,
  Download,
  Zap
} from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Casper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Gracie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

export function ProfileSettings() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);

  // Step 3 States
  const [passwordStep, setPasswordStep] = useState(0);
  const [currentPwd, setCurrentPwd] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [otpMethod, setOtpMethod] = useState<"email" | "phone">("email");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Rahat",
      email: "rahat@example.com",
      username: "rahat_nexrover",
      phone: "+1 (555) 000-0000",
      bio: "Frontend Engineer & UI/UX Designer",
      company: "Nexrover",
      role: "Lead Developer",
    },
  });

  const { isDirty } = form.formState;

  // 2FA Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show2FAModal && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [show2FAModal, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otpValue];
      newOtp[index] = value;
      setOtpValue(newOtp);

      // Auto-focus next
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Tab switching with loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTab(false), 600);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Prevent accidental tab closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving changes:", data);
    form.reset(data);
    setIsSaving(false);
    alert("Changes saved successfully!");
  };

  const handleTabChange = (tabId: string) => {
    if (isDirty && tabId !== activeTab) {
      setPendingTab(tabId);
      setShowDiscardModal(true);
    } else {
      setIsLoadingTab(true);
      setActiveTab(tabId);
    }
  };

  const confirmDiscard = () => {
    form.reset();
    if (pendingTab) {
      setIsLoadingTab(true);
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowDiscardModal(false);
  };

  const tabs = [
    { id: "general", label: t("profile.general"), icon: User },
    { id: "account", label: t("profile.account"), icon: Mail },
    { id: "notifications", label: t("profile.notifications"), icon: Bell },
    { id: "billing", label: t("profile.billing"), icon: CreditCard },
  ];

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    // In a real app, you might update the form state or trigger an API call
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("profile.title")}</h1>
          <p className="text-sm text-gray-500">
            {t("profile.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
              {t("profile.unsaved_changes")}
            </span>
          )}
          <button
            onClick={() => form.reset()}
            disabled={!isDirty || isSaving}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            {t("profile.cancel")}
          </button>
          <button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t("profile.saving") : t("profile.save_changes")}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-4">
          <nav className="flex gap-4 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 min-h-[500px]">
          {isLoadingTab ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <form className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "general" && (
                <div className="space-y-12">
                  {/* Avatar Section - 2 Column Layout */}
                  <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{t("profile.picture")}</h3>
                      <div className="flex items-center gap-6 p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="relative group shrink-0">
                          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md transition-all group-hover:scale-105 relative">
                            <Image src={selectedAvatar} alt="Profile" fill className="object-cover" />
                          </div>
                          <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white border-2 border-white shadow-sm hover:bg-indigo-700 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{t("profile.your_avatar")}</p>
                          <p className="text-xs text-gray-500 mt-1">{t("profile.avatar_desc")}</p>
                          <button 
                            type="button"
                            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            <Upload className="h-3 w-3" />
                            {t("profile.change_photo")}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{t("profile.quick_select")}</h3>
                      <div className="grid grid-cols-4 gap-3 p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                        {DEFAULT_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAvatarSelect(url)}
                            className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 relative ${
                              selectedAvatar === url ? "border-indigo-600 ring-4 ring-indigo-50" : "border-transparent"
                            }`}
                          >
                            <Image src={url} alt={`Avatar ${i}`} fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User Info Grid - 2 Column Layout */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{t("profile.personal_info")}</h3>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {[
                        { label: t("profile.username"), icon: User, name: "username", placeholder: "e.g. johndoe" },
                        { label: t("profile.email"), icon: Mail, name: "email", placeholder: "john@example.com" },
                        { label: t("profile.phone"), icon: Phone, name: "phone", placeholder: "+1 (555) 000-0000" },
                        { label: t("profile.role"), icon: Shield, name: "role", placeholder: "e.g. Designer" },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                            <field.icon className="h-3 w-3" />
                            {field.label}
                          </label>
                          <input
                            {...form.register(field.name as keyof ProfileFormValues)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder-gray-300 shadow-xs"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("profile.about")}</label>
                    <textarea
                      {...form.register("bio")}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none placeholder-gray-300 shadow-xs"
                      placeholder={t("profile.bio_placeholder")}
                    />
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="max-w-2xl space-y-12">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t("profile.pwd_security")}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("profile.pwd_desc")}</p>
                    </div>

                    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                      {passwordStep === 0 ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("profile.current_pwd")}</label>
                            <input
                              type="password"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all"
                              placeholder="••••••••"
                              onChange={(e) => setCurrentPwd(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => currentPwd === "password" ? setPasswordStep(1) : alert("Invalid current password (hint: 'password')")}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            {t("profile.verify_to_change")}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("profile.new_pwd")}</label>
                              <input type="password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("profile.confirm_new_pwd")}</label>
                              <input type="password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setPasswordStep(0)} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">{t("profile.cancel")}</button>
                            <button type="button" onClick={() => { alert("Password updated!"); setPasswordStep(0); }} className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">{t("profile.update_pwd_btn")}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t("profile.two_factor")}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t("profile.two_factor_desc")}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShow2FAModal(true)}
                        className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-all ${is2FAEnabled ? "bg-indigo-600" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${is2FAEnabled ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                    
                    {is2FAEnabled && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 flex items-center gap-4">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <div>
                          <p className="text-sm font-bold text-indigo-900">{t("profile.two_factor_active")}</p>
                          <p className="text-xs text-indigo-700 mt-1">{t("profile.two_factor_active_desc")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Danger Zone</h3>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-red-50/20 p-8 space-y-6 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{t("profile.delete_account")}</h4>
                        <p className="text-sm text-gray-500 mt-1">{t("profile.delete_desc")}</p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Type &quot;{form.getValues("username")}&quot; to confirm:</p>
                        <input
                          type="text" spellCheck="false" onPaste={(e) => e.preventDefault()}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all shadow-xs"
                          placeholder={t("profile.confirm_username")}
                        />
                        <button
                          type="button" disabled={deleteConfirm !== form.getValues("username")}
                          className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          {t("profile.delete_btn")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab - 2 Column Layout */}
              {activeTab === "notifications" && (
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t("profile.notifications_general")}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("profile.notifications_desc")}</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: "email", label: t("profile.email_alerts"), icon: Mail },
                        { id: "push", label: t("profile.browser_push"), icon: Bell },
                        { id: "sms", label: t("profile.sms_alerts"), icon: Phone },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          </div>
                          <button type="button" className="relative h-6 w-11 rounded-full bg-gray-200 border-2 border-transparent"><span className="translate-x-0 h-5 w-5 rounded-full bg-white block shadow transition" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t("profile.freq_timing")}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("profile.freq_desc")}</p>
                    </div>

                    <div className="space-y-4 p-8 rounded-xl border border-gray-100 bg-gray-50/30">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t("profile.delivery_freq")}</label>
                        <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 outline-none cursor-pointer shadow-xs">
                          <option>{t("profile.instantly")}</option>
                          <option>{t("profile.daily_digest")}</option>
                          <option>{t("profile.weekly_roundup")}</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{t("profile.critical_note")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab - 2 Column Layout */}
              {activeTab === "billing" && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-10 space-y-8 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                          <h3 className="text-4xl font-black text-gray-900 mt-4">{t("profile.free_plan")}</h3>
                          <p className="text-sm text-indigo-700/70 mt-2 font-medium">{t("profile.free_plan_desc")}</p>
                        </div>
                        <Zap className="h-10 w-10 text-indigo-600" />
                      </div>
                      <div className="space-y-4">
                        {[t("profile.f_monthly_certs"), t("profile.f_std_templates"), t("profile.f_community_support")].map((f, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700"><div className="h-2 w-2 rounded-full bg-indigo-500" />{f}</div>
                        ))}
                      </div>
                      <button className="w-full rounded-xl bg-indigo-600 px-4 py-5 text-sm font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">{t("profile.upgrade_pro")}</button>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl border border-gray-100 bg-white p-10 space-y-6 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900">{t("profile.promotions")}</h4>
                        <div className="flex gap-2">
                          <input type="text" placeholder="DISCOUNT20" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-xs" />
                          <button className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">{t("profile.apply")}</button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-10 flex items-center justify-between shadow-sm">
                        <div><p className="text-sm font-bold text-gray-900">{t("profile.next_payment")}</p><p className="text-2xl font-black text-indigo-600 mt-1">$0.00</p></div>
                        <CreditCard className="h-10 w-10 text-gray-100" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-bold text-gray-900">{t("profile.payment_history")}</h3>
                      <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">{t("profile.export_csv")}</button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <tr><th className="px-8 py-5">{t("profile.invoice")}</th><th className="px-8 py-5">{t("profile.date")}</th><th className="px-8 py-5">{t("profile.status")}</th><th className="px-8 py-5 text-right">{t("profile.download")}</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[
                            { id: "INV-2024-001", date: "May 10, 2024", status: t("profile.successful") },
                            { id: "INV-2024-002", date: "Apr 10, 2024", status: t("profile.successful") },
                          ].map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50/30 transition-all"><td className="px-8 py-6 font-bold text-gray-900">{inv.id}</td><td className="px-8 py-6 text-gray-500">{inv.date}</td><td className="px-8 py-6"><span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-600 uppercase tracking-tighter">{inv.status}</span></td><td className="px-8 py-6 text-right"><button className="text-gray-300 hover:text-indigo-600 transition-all"><Download className="h-5 w-5" /></button></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("profile.discard_title")}</h2>
                <p className="text-gray-500 mt-2">
                  {t("profile.discard_desc")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={confirmDiscard}
                className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
              >
                {t("profile.discard_btn")}
              </button>
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  setPendingTab(null);
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                {t("profile.go_back")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-8 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {is2FAEnabled ? t("profile.disable_2fa") : t("profile.enable_2fa")}
                </h2>
                <p className="text-gray-500 mt-2">
                  {t("profile.verify_identity", { action: is2FAEnabled ? (i18n.language === 'bn' ? 'নিষ্ক্রিয়' : 'disable') : (i18n.language === 'bn' ? 'সক্রিয়' : 'enable') })}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-4 p-1 rounded-xl bg-gray-100/50">
                <button
                  type="button"
                  onClick={() => setOtpMethod("email")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${otpMethod === "email" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {t("profile.email_otp")}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod("phone")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${otpMethod === "phone" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {t("profile.phone_otp")}
                </button>
              </div>

              <div className="flex justify-between gap-2">
                {otpValue.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="h-14 w-12 rounded-xl border-2 border-gray-100 bg-gray-50/50 text-center text-xl font-bold text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-500 font-medium">
                  {t("profile.expire_in")} <span className="text-indigo-600 font-bold">{formatTime(countdown)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setCountdown(300)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  {t("profile.resend_code")}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  setShow2FAModal(false);
                  setOtpValue(["", "", "", "", "", ""]);
                  setCountdown(300);
                  alert(`2FA has been ${!is2FAEnabled ? "enabled" : "disabled"} successfully!`);
                }}
                disabled={otpValue.some(v => v === "")}
                className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {t("profile.verify_action", { action: is2FAEnabled ? (i18n.language === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Disable') : (i18n.language === 'bn' ? 'সক্রিয় করুন' : 'Enable') })}
              </button>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="w-full rounded-xl border border-gray-200 px-4 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
