import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/app/dashboard/_components/stats-cards";
import { CertificateChart } from "@/app/dashboard/_components/certificate-chart";
import { RecentCertificates } from "@/app/dashboard/_components/recent-certificates";
import { QuickActions } from "@/app/dashboard/_components/quick-actions";
import { ComingSoon } from "@/app/dashboard/_components/coming-soon";
import { TemplateManagement } from "@/app/dashboard/_components/template-management";
import { redirect } from "next/navigation";
import { FiCalendar, FiChevronDown, FiMail } from "react-icons/fi";

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

  if (view === "emails") {
    return (
      <ComingSoon
        title="Coming Soon"
        subtitle="This feature is under development. We're working hard to bring you a powerful email builder."
        icon={FiMail}
      />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Certificate Templates</h1>
            <p className="mt-1.5 text-sm font-medium text-gray-500">
              Manage and create your professional certificate templates.
            </p>
          </div>
        </div>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1.5 text-sm font-medium text-gray-500">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! Here&apos;s what&apos;s happening with your certificates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50">
            <FiCalendar className="h-4 w-4 text-gray-400" />
            May 18 - May 24, 2024
            <FiChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

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
