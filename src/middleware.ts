import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicOnlyRoutes = ["/", "/login", "/create", "/newschool"];
const genericAuthenticatedRoute = "/auth";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get("origin");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const cookieStore = await cookies();
  const refreshToken =
    cookieStore.get("refreshtoken")?.value || req.cookies.get("refreshtoken")?.value || "";
  const url = req.nextUrl.clone();
  const requestedPath = url.pathname;

  const isPublicOnlyRoute = publicOnlyRoutes.includes(requestedPath);

  if (!refreshToken) {
    if (!isPublicOnlyRoute) {
      console.log(
        `Middleware: No token, redirecting from protected route ${requestedPath} to /login`
      );
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", requestedPath);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } else {
    if (isPublicOnlyRoute) {
      console.log(
        `Middleware: Logged-in user redirected from public-only route ${requestedPath} to ${genericAuthenticatedRoute}`
      );
      url.pathname = genericAuthenticatedRoute;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|manifest.json|sw.js|sw.ts|workbox-.*\\.js|\\.well-known/.*|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}