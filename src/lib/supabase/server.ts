import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export async function createClient() {
  const cookieStore = await cookies();
  const isRemembered = cookieStore.has("remember_me");
  const cookieOpts = getSupabaseCookieOptions(isRemembered);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieOpts,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, maxAge: cookieOpts.maxAge })
            );
          } catch {
            // Server Components can't always write cookies.
          }
        },
      },
    }
  );
}
