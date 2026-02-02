import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "./lib/proxy";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/proxy")) {
    return proxyRequest(request, "/proxy");
  } else {
    NextResponse.next();
  }
}

export const config = { matcher: "/proxy/:path*" };
