import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_EMAIL = "steblovskiyanton@gmail.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const protectedRoutes = ['/users', '/admin', '/specialist'];
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

    const isAdmin = String(session.email || "").toLowerCase() === ADMIN_EMAIL;
    const isSpecialist = session.role === "Специалист";

    // Проверка доступа к админке
    if (pathname.startsWith('/admin') && !isAdmin) {
      const url = new URL(`/users/${session.id}`, request.url);
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/admin') && isAdmin) {
      const adminIdFromPath = pathname.split('/').pop();
      if (adminIdFromPath && String(session.id) !== String(adminIdFromPath)) {
        const url = new URL(`/admin/${session.id}`, request.url);
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith('/specialist')) {
      const specialistIdFromPath = pathname.split('/').pop();
      if (!isSpecialist || (specialistIdFromPath && String(session.id) !== String(specialistIdFromPath))) {
        const url = new URL(`/users/${session.id}`, request.url);
        return NextResponse.redirect(url);
      }
    }

    // Проверка доступа к чужому профилю
    if (pathname.startsWith('/users/')) {
      const userIdFromPath = pathname.split('/').pop();
      if (userIdFromPath && !isAdmin && String(session.id) !== String(userIdFromPath)) {
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
  matcher: ['/users/:path*', '/admin/:path*', '/specialist/:path*'],
};