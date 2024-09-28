import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/helpers/crypto'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/', '/timemachine']
const publicRoutes = ['/login', '/register', '/verifyemail']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
  
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  let session, cookie;
  // 3. Decrypt the session from the cookie
  try {
    cookie = cookies().get('token')?.value;
    if (cookie) {
      session = await decrypt(cookie, process.env.JWT_SECRET as string)
      console.log(session)
    }
    // La logica di redirect è da ricontrollare!!!!
    if (session && !session.isVerified && isProtectedRoute) {
      return NextResponse.redirect(new URL('/verifyemail', req.nextUrl))
    }
    if (isPublicRoute) {
      return NextResponse.next()
    }
    if (isProtectedRoute && !session?._id) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
    
  } catch (error) {
    // token is invalid
    return NextResponse.redirect(new URL('/login', req.nextUrl))

  }

  // 5. Continue to the next middleware
  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
