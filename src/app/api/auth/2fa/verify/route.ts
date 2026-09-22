import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verify2FaOtp, get2FaLockoutState, record2FaFailure, clear2FaFailures } from "@/lib/auth/2fa";
import { cookies } from "next/headers";

const BodySchema = z.object({
  purpose: z.enum(["enable", "disable", "login"]),
  contact: z.string().optional(),
  code: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    
    let userId: string | undefined;
    let targetContact = body.contact;
    let tokenPayload: { 
      user_id: string; 
      contact: string; 
      access_token: string; 
      refresh_token: string; 
      remember_me: boolean 
    } | null = null;

    if (body.purpose === "login") {
      const cookieStore = await cookies();
      const tempSession = cookieStore.get("2fa_temp_session")?.value;
      if (!tempSession) {
        return NextResponse.json({ error: "Session expired. Please login again." }, { status: 401 });
      }
      tokenPayload = JSON.parse(tempSession);
      if (!tokenPayload) {
        return NextResponse.json({ error: "Invalid session data." }, { status: 401 });
      }
      userId = tokenPayload.user_id;
      targetContact = tokenPayload.contact;
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

    // Rate limiting check
    const lock = await get2FaLockoutState(userId);
    if (lock.locked && lock.lockedUntil) {
      const mins = Math.ceil((lock.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${mins} minute(s).` },
        { status: 423 }
      );
    }

    const isValid = await verify2FaOtp(userId, targetContact, body.purpose, body.code);

    if (!isValid) {
      await record2FaFailure(userId);
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await clear2FaFailures(userId);

    const supabaseAdmin = createAdminClient();

    if (body.purpose === "enable") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { is_2fa_enabled: true, two_factor_contact: targetContact }
      });
      return NextResponse.json({ success: true });
    } 
    else if (body.purpose === "disable") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { is_2fa_enabled: false, two_factor_contact: null }
      });
      return NextResponse.json({ success: true });
    }
    else if (body.purpose === "login") {
      if (!tokenPayload) {
        return NextResponse.json({ error: "Invalid session data." }, { status: 401 });
      }
      // Upgrade temp session to full session
      const { createRouteHandlerClient } = await import("@/lib/supabase/route-handler");
      const supabaseRouteClient = await createRouteHandlerClient(tokenPayload.remember_me);
      
      const { error: sessionError } = await supabaseRouteClient.auth.setSession({
        access_token: tokenPayload.access_token,
        refresh_token: tokenPayload.refresh_token,
      });

      if (sessionError) {
        return NextResponse.json({ error: "Failed to establish session." }, { status: 500 });
      }

      const cookieStore = await cookies();
      cookieStore.delete("2fa_temp_session");
      
      return NextResponse.json({ success: true });
    }

  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
