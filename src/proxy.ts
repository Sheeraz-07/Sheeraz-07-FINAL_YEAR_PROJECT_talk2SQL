import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/waiting-approval'];

  let userProfile: { role: string | null; status?: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role, status')
      .eq('email', user.email)
      .maybeSingle<{ role: string | null; status?: string | null }>();
    userProfile = data;
  }

  if (publicRoutes.includes(pathname)) {
    if (user && userProfile && (pathname === '/login' || pathname === '/register')) {
      if (userProfile.status !== 'approved') {
        return NextResponse.redirect(new URL('/waiting-approval', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    if (!userProfile) {
      return NextResponse.redirect(new URL('/register', request.url));
    }
    if (userProfile.status !== 'approved' && pathname !== '/waiting-approval') {
      return NextResponse.redirect(new URL('/waiting-approval', request.url));
    }

    if (pathname.startsWith('/admin')) {
      if (!['admin', 'super_admin'].includes(userProfile.role || '')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    if (pathname.startsWith('/super-admin')) {
      if (userProfile.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch (error) {
    console.error('Proxy auth error:', error);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|public).*)'],
};
