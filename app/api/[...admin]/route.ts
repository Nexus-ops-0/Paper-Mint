import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";
import { db, safeContent, getContent } from "@/lib/admin";
export const runtime = "nodejs";
const fail = () =>
  NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
function csrf(req: NextRequest) {
  const cookie = req.cookies.get("rent_admin_csrf")?.value,
    header = req.headers.get("x-csrf-token"),
    origin = req.headers.get("origin");
  if (!cookie || !header || cookie !== header || !origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
function params(path: string[]) {
  const route = process.env.ADMIN_PATH?.replace(/^\//, "");
  return route && path[0] === route ? path.slice(1) : null;
}
export async function GET(
  req: NextRequest,
  { params: p }: { params: Promise<{ admin: string[] }> },
) {
  const { admin } = await p,
    rest = params(admin);
  if (!rest || rest.length !== 1 || rest[0] !== "content")
    return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(await getContent(), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(
  req: NextRequest,
  { params: p }: { params: Promise<{ admin: string[] }> },
) {
  const { admin } = await p,
    rest = params(admin);
  if (!rest || rest.length !== 1)
    return new NextResponse("Not Found", { status: 404 });
  if (!csrf(req)) return new NextResponse("Not Found", { status: 404 });
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 32_000)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return fail();
  if (rest[0] === "login") {
    try {
      const body = await req.json();
      const parsed = z
        .object({
          username: z.string().max(120),
          password: z.string().max(200),
        })
        .safeParse(body);
      if (!parsed.success) return fail();
      const ip =
        req.headers.get("x-real-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      const { data: allowed, error } = await db().rpc("allow_admin_login", {
        ip_address: ip,
      });
      if (error || allowed !== true) {
        await new Promise((r) => setTimeout(r, 500));
        return fail();
      }
      const username = process.env.ADMIN_USERNAME || "",
        hash = process.env.ADMIN_PASSWORD_HASH || "";
      const valid = Boolean(
        username &&
          hash &&
          parsed.data.username === username &&
          (await bcrypt.compare(parsed.data.password, hash)),
      );
      if (!valid) {
        await db().rpc("record_admin_login_failure", { ip_address: ip });
        await new Promise((r) => setTimeout(r, 500));
        return fail();
      }
      await db().rpc("clear_admin_login_failures", { ip_address: ip });
      const jwt = await new SignJWT({ sub: username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("rentslip-admin")
        .setIssuedAt()
        .setExpirationTime("4h")
        .sign(new TextEncoder().encode(secret));
      const res = NextResponse.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      );
      res.cookies.set("rent_admin_session", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 14400,
      });
      return res;
    } catch {
      return fail();
    }
  }
  if (rest[0] === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("rent_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
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
  if (rest[0] === "content") {
    try {
      const body = await req.json(),
        content = safeContent(body);
      const { error } = await db()
        .from("site_content")
        .upsert({ id: "main", content, updated_at: new Date().toISOString() });
      if (error)
        return NextResponse.json({ error: "Save failed" }, { status: 503 });
      return NextResponse.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return NextResponse.json({ error: "Save failed" }, { status: 503 });
    }
  }
  return new NextResponse("Not Found", { status: 404 });
}
