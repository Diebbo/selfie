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
    cookie = cookies().get("token")?.value;
    if (cookie) {
      console.log("cookie");
      try {
        const res = await isVerified();
        console.log(res);
        if (!res && isProtectedRoute) {
          console.log("User not verified");
          return NextResponse.redirect(new URL("/verifyemail", req.nextUrl));
        }
        if (res && isPublicRoute) {
          console.log("Verified User want to switch account");
          return NextResponse.redirect(new URL("/change_account", req.nextUrl));
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      // Se non c'è il cookie allora l'utente non è loggato quindi lo si reindirizza alla pagina di login
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
    }
  } catch (error) {
    // token is invalid
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // User is logged in and doesn't want to change account
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
