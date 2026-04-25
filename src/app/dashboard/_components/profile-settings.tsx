"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  Bell, 
  Shield, 
  Save, 
  X,
  AlertCircle,
  Phone,
  Plus,
  Upload,
  Download,
  Tag,
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
    if (activeTab) {
      setIsLoadingTab(true);
      const timer = setTimeout(() => setIsLoadingTab(false), 600);
      return () => clearTimeout(timer);
    }
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
      setActiveTab(tabId);
    }
  };

  const confirmDiscard = () => {
    form.reset();
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowDiscardModal(false);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "account", label: "Account Settings", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
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
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your personal information, security preferences, and billing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
              Unsaved Changes
            </span>
          )}
          <button
            onClick={() => form.reset()}
            disabled={!isDirty || isSaving}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
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
                className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
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
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : (
            <form className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "general" && (
                <div className="space-y-10">
                  {/* Avatar Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md transition-all group-hover:scale-105">
                          <img src={selectedAvatar} alt="Profile" className="h-full w-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white border-2 border-white shadow-sm hover:bg-indigo-700 transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-4">Choose a default avatar or upload your own.</p>
                        <div className="flex flex-wrap gap-3">
                          {DEFAULT_AVATARS.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAvatarSelect(url)}
                              className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                                selectedAvatar === url ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent"
                              }`}
                            >
                              <img src={url} alt={`Avatar ${i}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                          <button 
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                          >
                            <Upload className="h-3 w-3" />
                            Upload Custom
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Info Grid */}
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        Username
                      </label>
                      <input
                        {...form.register("username")}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder-gray-400"
                        placeholder="e.g. johndoe"
                      />
                      {form.formState.errors.username && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        Email Address
                      </label>
                      <input
                        {...form.register("email")}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder-gray-400"
                        placeholder="john@example.com"
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        Phone Number
                      </label>
                      <input
                        {...form.register("phone")}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder-gray-400"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-gray-400" />
                        Role
                      </label>
                      <input
                        {...form.register("role")}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-gray-700">Bio</label>
                    <textarea
                      {...form.register("bio")}
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none placeholder-gray-400"
                      placeholder="Share a brief introduction about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Account Settings Tab */}
              {activeTab === "account" && (
                <div className="space-y-12">
                  {/* Change Password Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
                    </div>

                    <div className="max-w-md space-y-4 rounded-2xl border border-gray-100 bg-gray-50/30 p-6">
                      {passwordStep === 0 ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                            <input
                              type="password"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                              placeholder="••••••••"
                              onChange={(e) => setCurrentPwd(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => currentPwd === "password" ? setPasswordStep(1) : alert("Invalid current password (hint: 'password')")}
                            className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                          >
                            Verify Current Password
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input
                              type="password"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                            <input
                              type="password"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPasswordStep(0)}
                              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert("Password updated successfully!");
                                setPasswordStep(0);
                              }}
                              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2FA Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShow2FAModal(true)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                          is2FAEnabled ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            is2FAEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {is2FAEnabled && (
                      <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-6 flex items-center gap-4 animate-in fade-in duration-500">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-indigo-900">2FA is currently active</p>
                          <p className="text-sm text-indigo-700">Verifications are sent to your registered email.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Danger Zone</h3>
                    </div>

                    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-8 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Delete Account</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                          Type your username <span className="underline italic">"{form.getValues("username")}"</span> to confirm:
                        </p>
                        <input
                          type="text"
                          spellCheck="false"
                          onPaste={(e) => e.preventDefault()}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="w-full max-w-md rounded-xl border border-red-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all placeholder-gray-400"
                          placeholder="Confirm username"
                        />
                        <button
                          type="button"
                          disabled={deleteConfirm !== form.getValues("username")}
                          className="w-full max-w-md rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Delete Account Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                    <p className="text-sm text-gray-500">Choose how and when you want to be notified.</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { id: "email", label: "Email Notifications", desc: "Receive updates and alerts via email." },
                      { id: "push", label: "Push Notifications", desc: "Get real-time alerts on your browser." },
                      { id: "sms", label: "SMS Notifications", desc: "Receive critical alerts on your mobile device." },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/30">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none"
                        >
                          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-900">Notification Frequency</label>
                    <select className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all appearance-none cursor-pointer">
                      <option>Instantly</option>
                      <option>Weekly Digest</option>
                      <option>Monthly Summary</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Billing & Plans Tab */}
              {activeTab === "billing" && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Current Plan Card */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Current Plan</p>
                          <h3 className="text-3xl font-black text-gray-900 mt-2">Free Plan</h3>
                          <p className="text-sm text-gray-500 mt-1">Perfect for getting started.</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600">
                          <Zap className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {["Up to 10 certificates", "Basic templates", "Email support"].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Plus className="h-4 w-4 text-indigo-500" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <button className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                        Upgrade to Pro
                      </button>
                    </div>

                    {/* Quick Billing Actions */}
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-gray-100 p-8 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900">Have a coupon?</h4>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="CODE2024"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                            />
                          </div>
                          <button className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                            Apply
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 p-8 bg-gray-50/30 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Next Billing Date</p>
                          <p className="text-sm text-gray-500 mt-1">N/A (Free Plan)</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Billing History</h3>
                      <button className="text-sm font-bold text-indigo-600 hover:underline">Download All</button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4">Invoice ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {[
                            { id: "INV-001", date: "May 12, 2024", amount: "$0.00", status: "Paid" },
                            { id: "INV-002", date: "Apr 12, 2024", amount: "$0.00", status: "Paid" },
                          ].map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-gray-900">{invoice.id}</td>
                              <td className="px-6 py-4 text-gray-500">{invoice.date}</td>
                              <td className="px-6 py-4 text-gray-900">{invoice.amount}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                  <Download className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
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
                <h2 className="text-2xl font-bold text-gray-900">Unsaved Changes</h2>
                <p className="text-gray-500 mt-2">
                  You have unsaved changes on this tab. Leaving now will discard all modifications.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={confirmDiscard}
                className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
              >
                Discard & Continue
              </button>
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  setPendingTab(null);
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Go Back
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
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </h2>
                <p className="text-gray-500 mt-2">
                  To {is2FAEnabled ? "disable" : "enable"} two-factor authentication, please verify your identity.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-4 p-1 rounded-xl bg-gray-100/50">
                <button
                  type="button"
                  onClick={() => setOtpMethod("email")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    otpMethod === "email" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod("phone")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    otpMethod === "phone" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Phone OTP
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
                  Expire in <span className="text-indigo-600 font-bold">{formatTime(countdown)}</span>
                </p>
                <button 
                  type="button"
                  onClick={() => setCountdown(300)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Resend Code
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
                Verify & {is2FAEnabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="w-full rounded-xl border border-gray-200 px-4 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
