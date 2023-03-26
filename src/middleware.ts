import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import SHA256 from "crypto-js/sha256";

import { AUTH_COOKIE_NAME, getPassword } from "@/constants";

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const { pathname } = nextUrl;

  const authCookie = cookies.get(AUTH_COOKIE_NAME);

  // no auth cookie
  if (!authCookie) {
    if (!["/login"].includes(pathname)) return NextResponse.redirect(new URL("/login", request.url));

    return NextResponse.next();
  }

  // TODO Error: The edge runtime does not support Node.js 'stream' module.
  // So can't use ioRedis for now
  const password = getPassword();
  const hash = SHA256(password).toString();

  if (authCookie.value !== hash) {
    request.cookies.delete(AUTH_COOKIE_NAME);

    if (!["/login"].includes(pathname)) return NextResponse.redirect(new URL("/login", request.url));
  } else {
    if (["/login"].includes(pathname)) return NextResponse.redirect(new URL("/", request.url));
  }
}

// https://clerk.com/blog/skip-nextjs-middleware-static-and-public-files
// ignore static files and api routes
export const config = { matcher: "/((?!.*\\.|api\\/).*)" };
