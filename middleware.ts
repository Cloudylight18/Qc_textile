import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-jika-env-kosong-12345'
);

// Fungsi bantuan untuk menentukan path yang benar berdasarkan role
function getRolePath(role: string) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'pimpinan') return '/pimpinan/dashboard';
  return '/inspector'; // Inspector tidak memakai akhiran /dashboard
}

export async function middleware(request: NextRequest) {
  // Mendukung pengecekan dua nama cookie yang sering digunakan ('auth_token' atau 'session')
  const token = request.cookies.get('auth_token')?.value || request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  const isAdminArea = pathname.startsWith('/admin');
  const isInspectorArea = pathname.startsWith('/inspector');
  const isPimpinanArea = pathname.startsWith('/pimpinan');

  // Jika tidak ada token dan mencoba masuk area terproteksi
  if (!token && (isAdminArea || isInspectorArea || isPimpinanArea)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let userRole = null;

  // Verifikasi Token JWT
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      userRole = payload.role as string;
    } catch (error) {
      // Jika token tidak valid / dimanipulasi (Tampered / Expired)
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Hapus cookie yang tidak valid dari browser
      response.cookies.delete('auth_token');
      response.cookies.delete('session');
      return response;
    }
  }

  // Jika Token Valid
  if (userRole) {
    const correctPath = getRolePath(userRole);

    // Cegah user yang sudah login kembali ke halaman login/landing
    if (isAuthPage || isLandingPage) {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }

    // Proteksi Silang (Cross-Role Protection)
    if (isAdminArea && userRole !== 'admin') {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
    if (isInspectorArea && userRole !== 'inspector') {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
    if (isPimpinanArea && userRole !== 'pimpinan') {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/inspector/:path*',
    '/pimpinan/:path*',
  ],
};