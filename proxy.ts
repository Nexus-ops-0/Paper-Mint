import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
const unauthorized = () =>
  new NextResponse("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
function nextWithCsp(req: NextRequest) {
  // A fresh nonce lets Next's inline bootstrap run without allowing arbitrary inline scripts.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}
export async function proxy(req: NextRequest) {
  const configured = process.env.ADMIN_PATH;
  if (!configured) return nextWithCsp(req);
  const base = configured.startsWith("/") ? configured : `/${configured}`;
  const path = req.nextUrl.pathname;
  const admin =
    path === base ||
    path.startsWith(`${base}/`) ||
    path === `/api${base}` ||
    path.startsWith(`/api${base}/`);
  if (!admin) return nextWithCsp(req);
  const loginApi = `/api${base}/login`;
  const isLogin = req.method === "POST" && path === loginApi;
  const isLoginPage = req.method === "GET" && path === base;
  const secret = process.env.SESSION_SECRET;
  if (isLogin) return nextWithCsp(req);
  if (!secret || secret.length < 32) return unauthorized();
  try {
    await jwtVerify(
      req.cookies.get("rent_admin_session")?.value || "",
      new TextEncoder().encode(secret),
      { issuer: "rentslip-admin" },
    );
    const res = nextWithCsp(req);
    if (isLoginPage)
      res.cookies.set(
        "rent_admin_csrf",
        crypto.randomUUID() + crypto.randomUUID(),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 4,
        },
      );
    return res;
  } catch {
    if (!isLoginPage) return unauthorized();
    const res = nextWithCsp(req);
    res.cookies.set(
      "rent_admin_csrf",
      crypto.randomUUID() + crypto.randomUUID(),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 4,
      },
    );
    return res;
  }
}
export const config = { matcher: ["/:path*"] };
