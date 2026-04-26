import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, avatarUrl } = body;

    const metadataUpdates: Record<string, string> = {};

    if (firstName !== undefined) metadataUpdates.first_name = firstName;
    if (lastName !== undefined) metadataUpdates.last_name = lastName;
    if (phone !== undefined) metadataUpdates.phone = phone;
    if (avatarUrl !== undefined) metadataUpdates.avatar_url = avatarUrl;

    // Compute full_name
    const fn = firstName ?? user.user_metadata?.first_name ?? "";
    const ln = lastName ?? user.user_metadata?.last_name ?? "";
    metadataUpdates.full_name = [fn, ln].filter(Boolean).join(" ") || user.email?.split("@")[0] || "User";

    const { error } = await supabase.auth.updateUser({
      data: metadataUpdates,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[update-profile] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
