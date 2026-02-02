import { proxyRequest } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/api/proxy");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "/api/proxy");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "/api/proxy");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "/api/proxy");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "/api/proxy");
}
