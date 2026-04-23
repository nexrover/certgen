import { useEffect, useState } from "react";


interface UserProfile {
  name: string;
  avatarUrl: string | null;
  email: string | null;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        
        const { user } = await response.json();

        if (user) {
          const name =
            user.user_metadata?.full_name ||
            [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") ||
            user.email?.split("@")[0] ||
            "User";

          const avatarUrl = user.user_metadata?.avatar_url || null;

          setUserProfile({
            name,
            avatarUrl,
            email: user.email || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { userProfile, loading };
}
