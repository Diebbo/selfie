import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthLevel, isAuthenticated } from "./jose";

// 1. Specify protected and public routes
// const protectedRoutes = ['/dashboard', '/', '/timemachine']
const publicRoutes = [
  "/login",
  "/register",
  "/verifyemail",
  "/verification",
  "/lost-password",
  "/resetpassword",
];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const isProtectedRoute = !isPublicRoute;
  // to make manifest file public
  if (path === "/manifest.webmanifest") {
    return NextResponse.next();
  }

  if (
    process.env.REDIRECT === "true" &&
    req.headers.get("x-forwarded-proto") !== "https"
  ) {
    console.log("redirecting to https");
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}`,
      301,
    );
  }

  // 3. Decrypt the session from the cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      try {
        const res = await isAuthenticated(token);
        switch (res) {
          case AuthLevel.authenticated: // token is valid and email is verified
            if (isPublicRoute) {
              return NextResponse.redirect(
                new URL("/change_account", req.nextUrl),
              );
            }
            return NextResponse.next();
          case AuthLevel.notVerified: // token is valid but email is not verified
            if (path !== "/verifyemail" && path !== "/verification") {
              return NextResponse.redirect(
                new URL("/verifyemail", req.nextUrl),
              );
            }
            return NextResponse.next();
          case AuthLevel.unauthenticated: // token is invalid
          default:
            if (
              path === "/login" ||
              path === "/register" ||
              path === "/change_account"
            ) {
              // forward without redirects
              return NextResponse.next();
            }
            const loginUrl = new URL("/login", req.nextUrl);
            loginUrl.searchParams.append("redirect", path);
            return NextResponse.redirect(loginUrl);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      // Se non c'è il cookie allora l'utente non è loggato quindi lo si reindirizza alla pagina di login
      if (isProtectedRoute) {
        const loginUrl = new URL("/login", req.nextUrl);
        loginUrl.searchParams.append("redirect", path);
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (error) {
    // token is invalid
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.append("redirect", path);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
