import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/helpers/crypto'
import { cookies } from 'next/headers'
import { isVerified } from './actions/auth.action'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/', '/timemachine']
const publicRoutes = ['/login', '/register', '/verifyemail', '/verification']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
  
  let cookie;
  // 3. Decrypt the session from the cookie
  try {
    cookie = cookies().get('token')?.value;
    if (cookie) {
      console.log('cookie');
      try {
        const res = await isVerified();
        console.log(res);
        if (!res && isProtectedRoute) {
          return NextResponse.redirect(new URL('/verifyemail', req.nextUrl));
        }
        if (res && isPublicRoute) {
          return NextResponse.redirect(new URL('/change_account', req.nextUrl));
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
    /* OLD CODE for middleware 
    if (cookie) {
      session = await decrypt(cookie, process.env.JWT_SECRET as string)
    }
    console.log(session)
    if (session && session.isVerified && isPublicRoute) {
      return NextResponse.redirect(new URL('/change_account', req.nextUrl))
    }

    // La logica di redirect è da ricontrollare!!!!
    if (session && !session.isVerified && isProtectedRoute) {
      return NextResponse.redirect(new URL('/verifyemail', req.nextUrl))
    }
    if (isProtectedRoute && !session?._id) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
    
  } catch (error) {
    // token is invalid
    return NextResponse.redirect(new URL('/login', req.nextUrl))

  }
*/
  // 5. Continue to the next middleware
  
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
