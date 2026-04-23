import { NextResponse } from "next/server";
import { getJobWithCertificates } from "@/lib/services/job-service";
import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await getJobWithCertificates(id, user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to get job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
