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
  // Keep absolute-looking user paths below the fixed GitHub origin.
  const upstreamUrl = new URL(`${UPSTREAM_ROOT}${path}`);
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

  headers.delete("content-disposition");
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");
  headers.delete("cross-origin-resource-policy");
  headers.delete("x-frame-options");
  headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' blob: https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://apemind.ai https://raw.githubusercontent.com https://icons.duckduckgo.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com; manifest-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  );
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
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
