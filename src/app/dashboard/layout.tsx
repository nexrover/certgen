import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/app/dashboard/_components/dashboard-sidebar";
import { TopBar } from "@/app/dashboard/_components/top-bar";
import { UserProfileProvider } from "@/lib/user-profile-context";
import { SearchProvider } from "@/lib/search-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.email_confirmed_at) {
    redirect("/login?error=verify_email_required");
  }

  console.log("[DashboardLayout] user.email:", user.email);
  console.log("[DashboardLayout] user.user_metadata:", JSON.stringify(user.user_metadata));

  return (
    <UserProfileProvider>
      <SearchProvider>
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
          <DashboardSidebar userEmail={user.email} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-8">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SearchProvider>
    </UserProfileProvider>
  );
}
