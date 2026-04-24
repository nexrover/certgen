import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // We will use the service role just to see if ANY data exists from the UI
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
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
      .order("created_at", { ascending: false });
    
    return NextResponse.json({ lists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
