import { auth } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/", "/sign-in", "/sign-up"]);

const isPublicPath = (pathname: string): boolean => {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/uploads")) return true;
  return false;
};

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth;
  const path = nextUrl.pathname;

  if (isPublicPath(path)) {
    if (isAuthed && (path === "/sign-in" || path === "/sign-up")) {
      const url = nextUrl.clone();
      url.pathname = "/";
      return Response.redirect(url);
    }
    return;
  }

  if (!isAuthed) {
    const url = nextUrl.clone();
    url.pathname = "/sign-in";
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
