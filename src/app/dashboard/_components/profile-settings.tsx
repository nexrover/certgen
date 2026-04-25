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
  AlertCircle
} from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Rahat",
      email: "rahat@example.com",
      username: "rahat_nexrover",
      bio: "Frontend Engineer & UI/UX Designer",
      company: "Nexrover",
      role: "Lead Developer",
    },
  });

  const { isDirty } = form.formState;

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
    { id: "account", label: "Account", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

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
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
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
        <div className="p-6 sm:p-8">
          <form className="max-w-3xl space-y-8">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      {...form.register("fullName")}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Username</label>
                    <input
                      {...form.register("username")}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    {form.formState.errors.username && (
                      <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Bio</label>
                  <textarea
                    {...form.register("bio")}
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Company</label>
                    <input
                      {...form.register("company")}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Role</label>
                    <input
                      {...form.register("role")}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...form.register("email")}
                      className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                  <p className="text-xs text-gray-400 italic">This email will be used for all account-related notifications.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Close Account</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Deleting your account is permanent and cannot be undone. All your certificates and data will be lost.
                  </p>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Delete Account...
                  </button>
                </div>
              </div>
            )}

            {/* Other tabs placeholders */}
            {["security", "billing", "notifications"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  We're working hard to bring you {activeTab} settings. Stay tuned!
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-amber-600">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Discard Changes?</h2>
            </div>
            <p className="text-gray-600">
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
