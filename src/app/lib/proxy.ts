import { NextRequest } from "next/server";
import { BodyInit, fetch } from "undici";

const POKEAPI_BASE_URL = "https://pokeapi.co";
const POKEAPI_BASE_PATH = "/api/v2";

const excludeResponseHeaders = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
];

const excludeRequestHeaders = ["accept-encoding", "host", "connection"];

export async function proxyRequest(request: NextRequest, proxyPath: string) {
  const targetPath = request.nextUrl.pathname.replace(
    proxyPath,
    POKEAPI_BASE_PATH,
  );
  const targetUrl = new URL(targetPath, POKEAPI_BASE_URL);

  const requestHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!excludeRequestHeaders.includes(key.toLowerCase())) {
      requestHeaders.set(key, value);
    }
  });

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: requestHeaders,
    body: request?.body as BodyInit,
    duplex: "half",
  });

  const responseBodyPromise = response.arrayBuffer();
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (!excludeResponseHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return new Response(await responseBodyPromise, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
