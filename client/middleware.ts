import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isVerified } from './actions/auth.action'

// 1. Specify protected and public routes
// const protectedRoutes = ['/dashboard', '/', '/timemachine']
const publicRoutes = ['/login', '/register', '/verifyemail', '/verification', '/reset-login']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  const isProtectedRoute = !isPublicRoute
  
  let cookie;
  // 3. Decrypt the session from the cookie
  try {
    cookie = cookies().get('token')?.value;
    if (cookie) {
      try {
        const res = await isVerified();
        switch (res) {
          case 200: // token is valid and email is verified
            if (isPublicRoute) {
              return NextResponse.redirect(new URL('/change_account', req.nextUrl));
            }
            return NextResponse.next();
          case 403: // token is valid but email is not verified
            return NextResponse.redirect(new URL('/verifyemail', req.nextUrl));
          case 401: // token is invalid
          default:
            if (path === '/login' || path === '/register' || path === "/change_account") { // forward without redirects
              return NextResponse.next();
            }
            return NextResponse.redirect(new URL('/login', req.nextUrl));
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      // Se non c'è il cookie allora l'utente non è loggato quindi lo si reindirizza alla pagina di login
      console.log('no cookie');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
      }
    }
  } catch (error) {
    // token is invalid
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
