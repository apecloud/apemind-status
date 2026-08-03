import assert from "node:assert/strict";
import test from "node:test";

import worker from "./index.mjs";

test("proxies path and query without forwarding credentials", async () => {
  const originalFetch = globalThis.fetch;
  let capturedRequest;
  let capturedInit;
  globalThis.fetch = async (request, init) => {
    capturedRequest = request;
    capturedInit = init;
    return new Response("ok", { status: 200, headers: { "content-type": "text/plain" } });
  };

  try {
    const response = await worker.fetch(new Request("https://status.apemind.ai/client/app.js?v=1", {
      headers: {
        accept: "text/javascript",
        authorization: "Bearer secret",
        cookie: "session=secret",
      },
    }));

    assert.equal(capturedRequest.url, "https://raw.githubusercontent.com/apecloud/apemind-status/gh-pages/client/app.js?v=1");
    assert.equal(capturedRequest.headers.get("accept"), "text/javascript");
    assert.equal(capturedRequest.headers.get("authorization"), null);
    assert.equal(capturedRequest.headers.get("cookie"), null);
    assert.deepEqual(capturedInit.cf, { cacheEverything: true, cacheTtl: 60 });
    assert.equal(await response.text(), "ok");
    assert.equal(response.headers.get("content-type"), "text/javascript; charset=utf-8");
    assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000; includeSubDomains");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("maps the root request to the published index", async () => {
  const originalFetch = globalThis.fetch;
  let capturedRequest;
  globalThis.fetch = async (request) => {
    capturedRequest = request;
    return new Response("<html></html>", { status: 200 });
  };

  try {
    const response = await worker.fetch(new Request("https://status.apemind.ai/"));
    assert.equal(capturedRequest.url, "https://raw.githubusercontent.com/apecloud/apemind-status/gh-pages/index.html");
    assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("serves the published 404 document for missing paths", async () => {
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (request) => {
    urls.push(request.url);
    if (urls.length === 1) return new Response("missing", { status: 404 });
    return new Response("<html>not found</html>", { status: 200 });
  };

  try {
    const response = await worker.fetch(new Request("https://status.apemind.ai/unknown"));
    assert.equal(response.status, 404);
    assert.equal(urls[1], "https://raw.githubusercontent.com/apecloud/apemind-status/gh-pages/404.html");
    assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects non-read methods without calling the origin", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => assert.fail("origin fetch should not run");

  try {
    const response = await worker.fetch(new Request("https://status.apemind.ai/", { method: "POST" }));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET, HEAD");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("redirects plain HTTP to HTTPS", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => assert.fail("origin fetch should not run");

  try {
    const response = await worker.fetch(new Request("http://status.apemind.ai/history/web?window=7d"));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "https://status.apemind.ai/history/web?window=7d");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
