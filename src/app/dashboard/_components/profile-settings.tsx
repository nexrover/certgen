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
  Upload
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

              {/* Other tabs remain largely the same but with premium styling */}
              {activeTab === "account" && (
                <div className="space-y-10">
                  <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Security Warning</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Changing your email address will require you to re-verify your account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {["notifications", "billing"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                    <AlertCircle className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Coming Soon</h3>
                  <p className="text-gray-500 max-w-sm mt-2">
                    We're working hard to bring you {activeTab} settings. Stay tuned for updates!
                  </p>
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
    </div>
  );
}
