// Next.js middleware for authentication and role-based access
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get current path
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/reset-password',
    '/auth/forgot-password',
  ]

  // Check if path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth/')
  )

  // If public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For now, allow all routes (until Supabase is configured)
  // TODO: Uncomment authentication checks after Supabase setup
  /*
  // Check authentication for protected routes
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (error || !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Check role-based access for admin routes
  if (path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Check account status
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'suspended') {
    return NextResponse.redirect(new URL('/auth/suspended', request.url))
  }

  if (profile?.status === 'deleted') {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
