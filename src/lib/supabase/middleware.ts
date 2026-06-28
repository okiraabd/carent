import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use getSession — it doesn't validate the token.
  // Use getUser instead for security.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // If not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    // We'll check the user's role from metadata
    const role = user.user_metadata?.role || "CUSTOMER";
    if (role === "ADMIN") {
      url.pathname = "/admin/dashboard";
    } else if (role === "MANAGER") {
      url.pathname = "/manager/dashboard";
    } else {
      url.pathname = "/katalog";
    }
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user) {
    const role = user.user_metadata?.role || "CUSTOMER";

    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "MANAGER") {
      const url = request.nextUrl.clone();
      url.pathname = "/katalog";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/manager") && role !== "MANAGER") {
      const url = request.nextUrl.clone();
      url.pathname = role === "ADMIN" ? "/admin/dashboard" : "/katalog";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
