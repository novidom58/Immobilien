import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

// Domains, auf denen die HypoCasa-Seite (app/hypocasa) ausgeliefert wird.
const HYPOCASA_HOSTS = (process.env.HYPOCASA_HOSTS || "hypocasa.ch,www.hypocasa.ch")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

/**
 * hypocasa.ch zeigt nur die HypoCasa-Seite: «/» wird intern auf /hypocasa
 * umgeschrieben, API und Dateien laufen normal, alle anderen Pfade (NoviDom-
 * Seiten) leiten auf novidom-immo.ch weiter, damit nichts doppelt indexiert wird.
 */
function hypoCasaRoute(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (!HYPOCASA_HOSTS.includes(host)) return null;
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.rewrite(new URL("/hypocasa", request.url));
  if (pathname === "/hypocasa") return NextResponse.redirect(new URL("/", request.url), 308);
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) return NextResponse.next();
  return NextResponse.redirect(new URL(pathname + request.nextUrl.search, "https://www.novidom-immo.ch"), 307);
}

export async function proxy(request: NextRequest) {
  const hypoCasa = hypoCasaRoute(request);
  if (hypoCasa) return hypoCasa;

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  // Without Supabase configured there's no session to refresh or check.
  // Protected routes render their own "not configured" state instead of a
  // silent redirect loop.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !isPublicAdminPath && !user) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
