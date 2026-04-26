"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { User, Mail, CreditCard, Bell, Shield, Save, AlertCircle, Phone, Upload, Download, Zap, Camera, X, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Check } from "lucide-react";
import { useUserProfileContext } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/crop-image";

/* ─── Cropper Modal ──────────────────────────────────── */
interface CropperModalProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

function CropperModal({ image, onCropComplete, onCancel }: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="font-bold text-gray-900">Crop Profile Picture</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="relative flex-1 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="flex items-center gap-4">
            <ZoomOut className="h-4 w-4 text-gray-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <ZoomIn className="h-4 w-4 text-gray-400" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── helpers ─────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

/* ─── General Tab ────────────────────────────────────── */
function GeneralTab({ onCancel }: { onCancel: () => void }) {
  const { userProfile, updateProfile } = useUserProfileContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill from context
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setEmail(userProfile.email || "");
      setPhone(userProfile.phone || "");
      setAvatarUrl(userProfile.avatarUrl || null);
    }
  }, [userProfile]);

  const displayAvatar = previewUrl || avatarUrl;
  const isBlob = !!previewUrl;
  const displayLetter = ((firstName || userProfile?.name || "U")[0]).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2 MB"); return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setTempImageUrl(null);
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
    setAvatarUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true); setError(null); setSuccess(false);
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile) {
        const supabase = createClient();
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        finalAvatarUrl = urlData.publicUrl;
      }

      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, avatarUrl: finalAvatarUrl }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }

      // Real-time navbar update
      updateProfile({ firstName, lastName, phone, avatarUrl: finalAvatarUrl });
      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setPreviewUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <Save className="h-4 w-4 shrink-0" />
          Profile saved successfully!
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* LEFT: Avatar */}
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-8 shadow-sm">
          {/* Circular avatar */}
          <div className="relative group">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg bg-indigo-50 flex items-center justify-center relative">
              {displayAvatar ? (
                isBlob ? (
                  <img src={displayAvatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Image src={displayAvatar} alt="Profile" fill className="object-cover" unoptimized />
                )
              ) : (
                <span className="text-4xl font-bold text-indigo-600">{displayLetter}</span>
              )}
            </div>
            {/* Camera overlay */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full bg-indigo-600 border-2 border-white text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">JPG, PNG, GIF or SVG · Max 2 MB</p>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </button>

          {/* Remove button */}
          {displayAvatar && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Remove Photo
            </button>
          )}
        </div>

        {/* RIGHT: Personal info */}
        <div className="space-y-8">
          <div className="pb-2 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-500 mt-1">Update your personal details and how others see you.</p>
          </div>

          <div className="space-y-6">

            {/* First Name + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide">First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide">Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <div className="relative">
                <input
                  value={email}
                  readOnly
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 text-sm text-gray-400 cursor-not-allowed outline-none font-medium"
                  placeholder="john@example.com"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Shield className="h-4 w-4 text-gray-300" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 ml-1">Email address is managed through your authentication provider.</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone Number
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {tempImageUrl && (
          <CropperModal
            image={tempImageUrl}
            onCropComplete={handleCropComplete}
            onCancel={() => setTempImageUrl(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Stub tabs ───────────────────────────────────────── */
function AccountTab() {
  const { userProfile, updateProfile } = useUserProfileContext();

  const [passwordStep, setPasswordStep] = useState(0);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  // 2FA states
  const [twoFaStep, setTwoFaStep] = useState<0 | 1 | 2>(0); // 0: Idle, 1: Enter Contact, 2: Enter OTP
  const [twoFaContact, setTwoFaContact] = useState(userProfile?.twoFactorContact || "");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaTimeLeft, setTwoFaTimeLeft] = useState(300);
  
  const is2FAEnabled = userProfile?.is2FaEnabled || false;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (twoFaStep === 2) {
      setTwoFaTimeLeft(300);
      timer = setInterval(() => {
        setTwoFaTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [twoFaStep]);

  const [deleteConfirm, setDeleteConfirm] = useState("");

  const hasLength = newPwd.length >= 8;
  const hasCase = /[a-z]/.test(newPwd) && /[A-Z]/.test(newPwd);
  const hasComplexity = /[0-9]/.test(newPwd) || /[^a-zA-Z0-9]/.test(newPwd);

  const handleVerify = async () => {
    if (!currentPwd) return;
    setVerifyError("");
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: currentPwd })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || "Incorrect current password");
      } else {
        setIsVerified(true);
      }
    } catch (err) {
      setVerifyError("Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!hasLength || !hasCase || !hasComplexity) {
      setChangeError("Password does not meet requirements");
      return;
    }
    if (newPwd !== confirmPwd) {
      setChangeError("Passwords do not match");
      return;
    }
    setChangeError("");
    setIsChanging(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd })
      });
      const data = await res.json();
      if (!res.ok) {
        setChangeError(data.error || "Failed to update password");
      } else {
        setChangeSuccess(true);
        setTimeout(() => {
          setChangeSuccess(false);
          setPasswordStep(0);
          setIsVerified(false);
          setCurrentPwd("");
          setNewPwd("");
          setConfirmPwd("");
        }, 3000);
      }
    } catch (err) {
      setChangeError("Something went wrong");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Password & Security */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 border-b border-gray-100">
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-gray-900">Password & Security</h3>
          <p className="text-sm text-gray-500 mt-1">Keep your account safe by updating your password regularly.</p>
        </div>
        <button
          onClick={() => setPasswordStep(passwordStep === 1 ? 0 : 1)}
          className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          {passwordStep === 1 ? "Cancel" : "Change password"}
        </button>
      </div>

      {/* Password Change Form Overlay if step > 0 */}
      {passwordStep === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column: Inputs & Requirements */}
            <div className="lg:col-span-3 space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    disabled={isVerified}
                    className={`w-full rounded-xl border ${verifyError ? 'border-red-300' : 'border-gray-200'} bg-white px-4 py-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300 font-medium ${isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {verifyError && <p className="text-sm text-red-500 ml-1 mt-1 font-medium">{verifyError}</p>}
                {!isVerified && (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || !currentPwd}
                    className="mt-3 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </button>
                )}
              </div>

              {isVerified && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? "text" : "password"}
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300 font-medium"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300 font-medium"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password requirements:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${hasLength ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Check className={`h-2.5 w-2.5 transition-colors ${hasLength ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${hasCase ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Check className={`h-2.5 w-2.5 transition-colors ${hasCase ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        Include uppercase and lowercase letters
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${hasComplexity ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Check className={`h-2.5 w-2.5 transition-colors ${hasComplexity ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        Include at least one number or special character
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Tips Card */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-8 space-y-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Tips for a strong password</h4>
                  <ul className="space-y-3">
                    {[
                      "Use a mix of letters, numbers & symbols",
                      "Avoid using personal information",
                      "Don't reuse old passwords"
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-gray-100 mt-4">
              {changeError && <p className="text-sm font-medium text-red-500">{changeError}</p>}
              {changeSuccess && <p className="text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-xl">Password updated successfully!</p>}
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={isChanging || changeSuccess}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Two-Factor Authentication */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 border-b border-gray-100">
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mt-1">Extra security for your login sessions.</p>
        </div>
        <button
          onClick={() => {
            if (is2FAEnabled) {
              setTwoFaStep(2);
              setTwoFaLoading(true);
              fetch("/api/auth/2fa/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purpose: "disable" })
              }).finally(() => setTwoFaLoading(false));
            } else {
              setTwoFaStep(1);
            }
          }}
          disabled={twoFaLoading}
          className={`px-8 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${is2FAEnabled
              ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {is2FAEnabled ? "On" : "OFF"}
        </button>
      </div>

      {twoFaStep > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            {is2FAEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
          </h4>
          
          {twoFaError && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{twoFaError}</p>}
          
          {twoFaStep === 1 && !is2FAEnabled && (
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 block">Valid Email or Phone Number</label>
              <input
                type="text"
                value={twoFaContact}
                onChange={e => setTwoFaContact(e.target.value)}
                className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                placeholder="email@example.com or +15550000"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setTwoFaStep(0)}
                  className="px-6 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setTwoFaError("");
                    setTwoFaLoading(true);
                    try {
                      const res = await fetch("/api/auth/2fa/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ purpose: "enable", contact: twoFaContact })
                      });
                      if (!res.ok) throw new Error("Failed to send OTP");
                      setTwoFaStep(2);
                    } catch(e: any) {
                      setTwoFaError(e.message);
                    } finally {
                      setTwoFaLoading(false);
                    }
                  }}
                  disabled={twoFaLoading || !twoFaContact}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {twoFaLoading ? "Sending..." : "Verify"}
                </button>
              </div>
            </div>
          )}

          {twoFaStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to your {is2FAEnabled ? 'registered contact' : 'contact'}.
              </p>
              <input
                type="text"
                maxLength={6}
                value={twoFaCode}
                onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full max-w-xs rounded-xl border border-gray-200 px-4 py-3 text-2xl tracking-[0.5em] text-center font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                placeholder="000000"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setTwoFaStep(0); setTwoFaCode(""); }}
                  className="px-6 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setTwoFaError("");
                    setTwoFaLoading(true);
                    try {
                      const purpose = is2FAEnabled ? "disable" : "enable";
                      const res = await fetch("/api/auth/2fa/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ purpose, contact: twoFaContact, code: twoFaCode })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Invalid code");
                      
                      updateProfile({ is2FaEnabled: !is2FAEnabled, twoFactorContact: is2FAEnabled ? null : twoFaContact });
                      setTwoFaStep(0);
                      setTwoFaCode("");
                      alert(`2FA successfully ${is2FAEnabled ? "disabled" : "enabled"}!`);
                    } catch(e: any) {
                      setTwoFaError(e.message);
                    } finally {
                      setTwoFaLoading(false);
                    }
                  }}
                  disabled={twoFaLoading || twoFaCode.length !== 6}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {twoFaLoading ? "Verifying..." : "Confirm"}
                </button>
              </div>
              <div className="text-center mt-4 text-sm text-gray-500">
                {twoFaTimeLeft > 0 ? (
                  <span>Code expires in <strong className="text-gray-900 font-bold">{Math.floor(twoFaTimeLeft / 60)}:{(twoFaTimeLeft % 60).toString().padStart(2, '0')}</strong></span>
                ) : (
                  <button 
                    type="button" 
                    onClick={async () => {
                      setTwoFaTimeLeft(300);
                      setTwoFaError("");
                      try {
                        const res = await fetch("/api/auth/2fa/send", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ purpose: is2FAEnabled ? "disable" : "enable", contact: twoFaContact })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Failed to resend");
                      } catch(e: any) {
                        setTwoFaError(e.message);
                      }
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-bold">Danger Zone</h3>
        </div>

        <div className="rounded-2xl border border-red-50 bg-white shadow-sm max-w-2xl overflow-hidden ring-1 ring-red-50">
          <div className="p-8 space-y-6">
            <div>
              <h4 className="text-base font-bold text-gray-900">Delete Your Account</h4>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">Once deleted, all your certificate data is permanently lost. This action is irreversible.</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                TYPE &quot;CONFIRM&quot; TO PROCEED:
              </p>
              <input
                type="text"
                spellCheck="false"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all placeholder:text-gray-300 font-medium"
                placeholder="confirm"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={deleteConfirm !== "confirm"}
            className={`w-full py-5 text-sm font-bold text-white transition-all ${deleteConfirm === "confirm"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
              }`}
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="space-y-8">
        <div><h3 className="text-lg font-bold text-gray-900">General Notifications</h3><p className="text-sm text-gray-500 mt-1">Control which updates you receive.</p></div>
        <div className="space-y-4">
          {[{ id: "email", label: "Email Alerts", icon: Mail }, { id: "push", label: "Browser Push", icon: Bell }, { id: "sms", label: "SMS Alerts", icon: Phone }].map(item => (
            <div key={item.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><item.icon className="h-5 w-5" /></div>
                <p className="text-sm font-bold text-gray-900">{item.label}</p>
              </div>
              <button type="button" className="relative h-6 w-11 rounded-full bg-gray-200 border-2 border-transparent"><span className="translate-x-0 h-5 w-5 rounded-full bg-white block shadow transition" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-8">
        <div><h3 className="text-lg font-bold text-gray-900">Frequency &amp; Timing</h3><p className="text-sm text-gray-500 mt-1">Decide how often you want to be interrupted.</p></div>
        <div className="space-y-4 p-8 rounded-xl border border-gray-100 bg-gray-50/30">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Delivery Frequency</label>
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 outline-none cursor-pointer shadow-xs">
              <option>Instantly (Highly recommended)</option>
              <option>Daily Digest</option>
              <option>Weekly Roundup</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">Note: Critical security alerts will always be sent instantly.</p>
        </div>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-10 space-y-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest">Active</span>
              <h3 className="text-4xl font-black text-gray-900 mt-4">Free Plan</h3>
              <p className="text-sm text-indigo-700/70 mt-2 font-medium">Starter plan for individuals</p>
            </div>
            <Zap className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="space-y-4">{["10 Monthly Certificates", "Standard Templates", "Community Support"].map((f, i) => (<div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700"><div className="h-2 w-2 rounded-full bg-indigo-500" />{f}</div>))}</div>
          <button className="w-full rounded-xl bg-indigo-600 px-4 py-5 text-sm font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">Upgrade to Pro</button>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-10 space-y-6 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900">Promotions</h4>
            <div className="flex gap-2">
              <input type="text" placeholder="DISCOUNT20" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-xs" />
              <button className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">Apply</button>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-10 flex items-center justify-between shadow-sm">
            <div><p className="text-sm font-bold text-gray-900">Next Payment</p><p className="text-2xl font-black text-indigo-600 mt-1">$0.00</p></div>
            <CreditCard className="h-10 w-10 text-gray-100" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
          <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">Export CSV</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr><th className="px-8 py-5">Invoice</th><th className="px-8 py-5">Date</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Download</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[{ id: "INV-2024-001", date: "May 10, 2024" }, { id: "INV-2024-002", date: "Apr 10, 2024" }].map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/30 transition-all"><td className="px-8 py-6 font-bold text-gray-900">{inv.id}</td><td className="px-8 py-6 text-gray-500">{inv.date}</td><td className="px-8 py-6"><span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[10px] font-black text-green-600 uppercase tracking-tighter">Successful</span></td><td className="px-8 py-6 text-right"><button className="text-gray-300 hover:text-indigo-600 transition-all"><Download className="h-5 w-5" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function ProfileSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: t("dashboard.profile.general"), icon: User },
    { id: "account", label: t("dashboard.profile.account"), icon: Mail },
    { id: "notifications", label: t("dashboard.profile.notifications"), icon: Bell },
    { id: "billing", label: t("dashboard.profile.billing"), icon: CreditCard },
  ];

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("dashboard.profile.title")}</h1>
          <p className="text-base text-gray-500 mt-1">{t("dashboard.profile.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Save
          </button>
        </div>
      </div>

      {/* Card with tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-200 bg-gray-50/30 px-6">
          <nav className="flex gap-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 py-5 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                  }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-indigo-600" : "text-gray-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab body */}
        <div className="p-6 sm:p-8 min-h-[500px] animate-in fade-in duration-300">
          {activeTab === "general" && <GeneralTab onCancel={handleCancel} />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
}
