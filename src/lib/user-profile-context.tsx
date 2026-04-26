"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface UserProfile {
  name: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refetch: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Failed to fetch user");

      const { user } = await response.json();

      if (user) {
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        const fullName =
          user.user_metadata?.full_name ||
          [firstName, lastName].filter(Boolean).join(" ") ||
          user.email?.split("@")[0] ||
          "User";

        setUserProfile({
          name: fullName,
          firstName,
          lastName,
          email: user.email || null,
          phone: user.user_metadata?.phone || null,
          avatarUrl: user.user_metadata?.avatar_url || null,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Recompute display name if first/last changed
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const fn = updates.firstName ?? prev.firstName;
        const ln = updates.lastName ?? prev.lastName;
        updated.name = [fn, ln].filter(Boolean).join(" ") || prev.email?.split("@")[0] || "User";
      }
      return updated;
    });
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, updateProfile, refetch: fetchUser }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfileContext must be used inside UserProfileProvider");
  return ctx;
}
