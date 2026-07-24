import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil Cookie Role
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Debugging (Muncul di Terminal VS Code)
  // console.log(`[MIDDLEWARE] Path: ${pathname} | Role: ${role || 'Guest'}`);

  // 2. Definisi Area Proteksi
  const isAuthPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  const isAdminArea = pathname.startsWith('/admin');
  const isInspectorArea = pathname.startsWith('/inspector');
  const isPimpinanArea = pathname.startsWith('/pimpinan');

  // 3. LOGIC REDIRECT: Jika SUDAH Login
  if (role) {
    // Jika iseng buka halaman Login atau Landing Page, lempar ke dashboard masing-masing
    if (isAuthPage || isLandingPage) {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }

    // Proteksi Silang: Jika Admin coba masuk ke area Inspector, atau sebaliknya
    if (isAdminArea && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (isInspectorArea && role !== 'inspector') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (isPimpinanArea && role !== 'pimpinan') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  // 4. LOGIC REDIRECT: Jika BELUM Login
  if (!role) {
    // Jika mencoba masuk ke area internal, paksa ke halaman login
    if (isAdminArea || isInspectorArea || isPimpinanArea) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// MATCH CONFIGURE
// Pastikan semua path yang butuh dijaga ada di sini
export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/inspector/:path*',
    '/pimpinan/:path*',
  ],
};