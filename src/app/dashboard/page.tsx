import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/app/dashboard/_components/stats-cards";
import { CertificateChart } from "@/app/dashboard/_components/certificate-chart";
import { RecentCertificates } from "@/app/dashboard/_components/recent-certificates";
import { QuickActions } from "@/app/dashboard/_components/quick-actions";
import { TemplateManagement } from "@/app/dashboard/_components/template-management";
import { RecipientManagement } from "@/app/dashboard/_components/recipient-management";
import { ProfileSettings } from "@/app/dashboard/_components/profile-settings";
import { WelcomeHeader } from "@/app/dashboard/_components/welcome-header";
import { redirect } from "next/navigation";
import { getCategoryByView, TEMPLATE_VIEW_SLUGS, getTableName, TEMPLATE_CATEGORIES } from "@/lib/template-categories";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { view } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    redirect("/login");
  }

  if (view === "profile") {
    return (
      <div className="min-h-[calc(100vh-10rem)]">
        <ProfileSettings />
      </div>
    );
  }

  if (view === "csvs") {
    const { data: lists } = await supabase
      .from("recipient_lists")
      .select(`
        id,
        name,
        headers,
        created_at,
        recipients (
          id,
          name,
          email,
          status,
          attributes
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return (
      <div className="h-[calc(100vh-2rem)]">
        <RecipientManagement initialLists={lists || []} />
      </div>
    );
  }

  /* ── Template category views ─────────────────────────────────
   * All sidebar items under "Templates" (certificate, youtube-thumbnail,
   * email, etc.) share the same TemplateManagement UI, filtered by
   * the `category` column in certificate_templates.
   * ─────────────────────────────────────────────────────────── */
  const viewStr = typeof view === "string" ? view : "";
  if (TEMPLATE_VIEW_SLUGS.includes(viewStr)) {
    const categoryConfig = getCategoryByView(viewStr)!;

    const { data: templatesData } = await supabase
      .from(getTableName(categoryConfig.category))
      .select("*")
      .eq("user_id", userId)
      .eq("category", categoryConfig.category)
      .order("created_at", { ascending: false });

    return (
      <div className="space-y-8">
        <TemplateManagement
          templates={templatesData || []}
          categoryConfig={categoryConfig}
        />
      </div>
    );
  }

  // Fetch real data for the main dashboard view
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Calculate total template count across all categories
  const templateCountPromises = TEMPLATE_CATEGORIES.map(async (category) => {
    const tableName = getTableName(category.category);
    const { count } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count || 0;
  });

  const templateCounts = await Promise.all(templateCountPromises);
  const totalTemplateCount = templateCounts.reduce((acc, count) => acc + count, 0);

  const { count: certificateCount } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader userName={user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'User'} />

      {/* Stats Section */}
      <StatsCards
        templateCount={totalTemplateCount}
        certificateCount={certificateCount || 0}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Recent Certificates */}
        <div className="lg:col-span-2">
          <RecentCertificates certificates={certificates || []} />
        </div>

        {/* Right Column - Analytics & Actions */}
        <div className="space-y-8">
          <CertificateChart />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
