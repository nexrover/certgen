import { notFound } from "next/navigation";
import { getJobWithCertificates } from "@/lib/services/job-service";
import { JobPoller } from "./_components/job-poller";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  let result;
  try {
    result = await getJobWithCertificates(id, user.id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Job Status</h1>
      <p className="mb-8 text-sm text-gray-500">
        Job ID: <code className="rounded bg-gray-100 px-1.5 py-0.5">{id}</code>
      </p>

      <JobPoller
        jobId={id}
        initialJob={result.job}
        initialCertificates={result.certificates}
      />
    </div>
  );
}
