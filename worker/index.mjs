const UPSTREAM_ROOT = "https://raw.githubusercontent.com/apecloud/apemind-status/gh-pages/";
const SAFE_REQUEST_HEADERS = [
  "accept",
  "accept-encoding",
  "accept-language",
  "if-modified-since",
  "if-none-match",
  "range",
  "user-agent",
];

function assetPath(request) {
  const incomingUrl = new URL(request.url);
  const pathname = incomingUrl.pathname === "/" ? "index.html" : incomingUrl.pathname.replace(/^\/+/, "");
  return `${pathname}${incomingUrl.search}`;
}

function buildUpstreamRequest(request, path = assetPath(request)) {
  const upstreamUrl = new URL(path, UPSTREAM_ROOT);
  const headers = new Headers();

  for (const name of SAFE_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }

  return new Request(upstreamUrl, {
    method: request.method,
    headers,
    redirect: "manual",
  });
}

function contentType(path) {
  const pathname = new URL(path, "https://status.apemind.ai").pathname.toLowerCase();
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (pathname.endsWith(".json") || pathname.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return null;
}

function buildResponse(upstreamResponse, path, status = upstreamResponse.status) {
  const headers = new Headers(upstreamResponse.headers);
  const type = contentType(path);
  if (type) headers.set("content-type", type);

  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  headers.set("x-content-type-options", "nosniff");

  return new Response(upstreamResponse.body, {
    status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    if (incomingUrl.protocol !== "https:") {
      incomingUrl.protocol = "https:";
      return Response.redirect(incomingUrl, 308);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    const path = assetPath(request);
    let upstreamResponse = await fetch(buildUpstreamRequest(request, path), {
      cf: { cacheEverything: true, cacheTtl: 60 },
    });

    if (upstreamResponse.status === 404 && path !== "404.html") {
      upstreamResponse = await fetch(buildUpstreamRequest(request, "404.html"), {
        cf: { cacheEverything: true, cacheTtl: 60 },
      });
      return buildResponse(upstreamResponse, "404.html", 404);
    }

    return buildResponse(upstreamResponse, path);
  },
};
