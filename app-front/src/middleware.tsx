import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // пропускаем API‑роуты
  if (pathname.startsWith('/api')) return NextResponse.next();

  // защищённые страницы
  if (pathname.startsWith('/profile') || pathname.startsWith('/admin')) {
    // относительный путь → запрос не выходит наружу, TLS не нужен
    const res = await fetch('/api/check-auth', {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    });

    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/';
      if (!pathname.startsWith('/admin')) url.searchParams.set('requireAuth', 'true');
      return NextResponse.redirect(url);
    }

    // проверка прав админа
    if (pathname.startsWith('/admin')) {
      const { user } = await res.json();
      if (!user?.is_superuser) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/profile'] };
