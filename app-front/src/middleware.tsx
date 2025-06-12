import { NextResponse, NextRequest } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Пропускаем запросы к API
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Защищенные маршруты
  if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
    const response = await fetch(`${req.nextUrl.origin}/api/check-auth`, {
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
      credentials: "include",
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

    // Проверка прав администратора
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