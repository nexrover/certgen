import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { send2FaOtp } from "@/lib/auth/2fa";
import { cookies } from "next/headers";

const BodySchema = z.object({
  purpose: z.enum(["enable", "disable", "login"]),
  contact: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    
    let userId: string | undefined;
    let targetContact = body.contact;

    if (body.purpose === "login") {
      const cookieStore = await cookies();
      const tempSession = cookieStore.get("2fa_temp_session")?.value;
      if (!tempSession) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      }
      const parsed = JSON.parse(tempSession);
      userId = parsed.user_id;
      targetContact = parsed.contact;
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      if (body.purpose === "disable") {
        targetContact = user.user_metadata?.two_factor_contact || user.email;
      }
    }

    if (!userId || !targetContact) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await send2FaOtp(userId, targetContact, body.purpose);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
