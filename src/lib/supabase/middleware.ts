import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { log } from "@/lib/logger";
import { PROTECTED_ROUTES, AUTH_ROUTES } from "@/lib/constants";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseHeaders = new Headers();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          const previousCookies = supabaseResponse.cookies.getAll();
          supabaseResponse = NextResponse.next({ request });
          previousCookies.forEach((cookie) =>
            supabaseResponse.cookies.set(cookie)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([name, value]) =>
            supabaseHeaders.set(name, value)
          );
          supabaseHeaders.forEach((value, name) =>
            supabaseResponse.headers.set(name, value)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPasswordRecovery = pathname === "/reset-password";

  const preserveSupabaseState = (response: NextResponse) => {
    if (response !== supabaseResponse) {
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        response.cookies.set(cookie)
      );
    }
    supabaseHeaders.forEach((value, name) =>
      response.headers.set(name, value)
    );
    return response;
  };

  const protectResponse = (response: NextResponse) => {
    const cacheControl = response.headers.get("Cache-Control");
    const directives = cacheControl
      ? cacheControl.split(",").map((directive) => directive.trim().toLowerCase())
      : [];
    const additions = ["private", "no-store"].filter(
      (directive) => !directives.includes(directive)
    );

    if (additions.length > 0) {
      response.headers.set(
        "Cache-Control",
        [cacheControl, ...additions].filter(Boolean).join(", ")
      );
    }
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
    return response;
  };

  if (!isAuthenticated && isProtected) {
    log("MW", `redirect → /login (no user for ${pathname})`);
    const url = new URL("/login", request.url);
    const redirectPath = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set("redirect", redirectPath);
    return protectResponse(
      preserveSupabaseState(NextResponse.redirect(url))
    );
  }

  if (isAuthenticated && isAuthRoute && !isPasswordRecovery) {
    log("MW", `redirect → /projects (authed user on ${pathname})`);
    const url = new URL("/projects", request.url);
    return protectResponse(
      preserveSupabaseState(NextResponse.redirect(url))
    );
  }

  return isProtected ? protectResponse(supabaseResponse) : supabaseResponse;
}
