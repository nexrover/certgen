import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
