import { NextResponse, NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL; // убедись, что оно определено

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
    // 🔥 важно: НЕ использовать req.nextUrl.origin
    const response = await fetch(`${API}/api/check-auth`, {
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const url = req.nextUrl.clone();
      if (pathname.startsWith("/admin")) {
        url.pathname = "/admin/login";
      } else {
        url.pathname = "/";
        url.searchParams.set("requireAuth", "true");
      }
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin")) {
      const data = await response.json();
      if (!data.user.is_superuser) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile"],
};
