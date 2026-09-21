import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/cadastro"];

const ROLE_ROUTES: Record<string, string> = {
  aluno: "/aluno/dashboard",
  tutor: "/tutor/painel",
  gestor: "/gestor/relatorios",
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!user && !isPublic && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    const role = user.user_metadata?.role || "aluno";
    const dest = ROLE_ROUTES[role] || "/aluno/dashboard";

    if (isPublic) {
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (role === "aluno" && !pathname.startsWith("/aluno")) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (role === "tutor" && !pathname.startsWith("/tutor")) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (role === "gestor" && !pathname.startsWith("/gestor")) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};