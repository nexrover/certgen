import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/app/dashboard/_components/stats-cards";
import { CertificateChart } from "@/app/dashboard/_components/certificate-chart";
import { RecentCertificates } from "@/app/dashboard/_components/recent-certificates";
import { QuickActions } from "@/app/dashboard/_components/quick-actions";
import { ComingSoon } from "@/app/dashboard/_components/coming-soon";
import { TemplateManagement } from "@/app/dashboard/_components/template-management";
import { RecipientManagement } from "@/app/dashboard/_components/recipient-management";
import { ProfileSettings } from "@/app/dashboard/_components/profile-settings";
import { WelcomeHeader } from "@/app/dashboard/_components/welcome-header";
import { redirect } from "next/navigation";

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

  if (view === "emails") {
    return (
      <ComingSoon
        view="emails"
      />
    );
  }

  const comingSoonViews = [
    { view: "youtube-thumbnail", title: "YouTube Thumbnail" },
    { view: "ecommerce", title: "E-commerce Marketing" },
    { view: "real-estate", title: "Real Estate Marketing" },
    { view: "shipping-label", title: "Shipping Label" },
    { view: "resume", title: "Resume" },
    { view: "open-graph", title: "Open Graph" },
    { view: "christmas-card", title: "Christmas Card" },
    { view: "social-media", title: "Social Media" },
    { view: "receipt", title: "Receipt" },
    { view: "invoice", title: "Invoice" },
  ];

  const matchedView = comingSoonViews.find(v => v.view === view);
  if (matchedView) {
    return (
      <ComingSoon
        title={matchedView.title}
        view={matchedView.view}
      />
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

  if (view === "templates") {
    const { data: templatesData } = await supabase
      .from("certificate_templates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return (
      <div className="space-y-8">
        <TemplateManagement templates={templatesData || []} />
      </div>
    );
  }

  // Fetch real data
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: templateCount } = await supabase
    .from("certificate_templates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

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
        templateCount={templateCount || 0}
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
