import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const protectedRoutes = ['/users', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // ✅ Читаем сессию из куки (а не весь объект user)
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    
    if (!session.id) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }

    // Проверка доступа к админке
    if (pathname.startsWith('/admin') && session.role !== 'Admin') {
      const url = new URL(`/users/${session.id}`, request.url);
      return NextResponse.redirect(url);
    }

    // Проверка доступа к чужому профилю
    if (pathname.startsWith('/users/')) {
      const userIdFromPath = pathname.split('/').pop();
      if (userIdFromPath && String(session.id) !== String(userIdFromPath)) {
        const url = new URL(`/users/${session.id}`, request.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/users/:path*', '/admin/:path*'],
};