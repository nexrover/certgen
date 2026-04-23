import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isRemembered = request.cookies.has("remember_me");
  const cookieOpts = getSupabaseCookieOptions(isRemembered);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieOpts,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, maxAge: cookieOpts.maxAge })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/api")) {
    return response;
  }

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isBuilderRoute = request.nextUrl.pathname.startsWith("/builder");
  const isProtectedRoute = isDashboardRoute || isBuilderRoute;
  const isVerified = Boolean(user?.email_confirmed_at);

  if ((!user || (isDashboardRoute && !isVerified)) && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);

    if (user && !isVerified && isDashboardRoute) {
      url.searchParams.set("error", "verify_email_required");
    }

    return NextResponse.redirect(url);
  }

  return response;
}
