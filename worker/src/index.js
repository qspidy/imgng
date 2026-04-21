function response(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function unauthorized() {
  return new Response("unauthorized\n", {
    status: 401,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="upload"',
      "Cache-Control": "no-store",
    },
  });
}

function notFound() {
  return response("not found\n", 404);
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return null;
  }

  return {
    user: decoded.slice(0, separator),
    pass: decoded.slice(separator + 1),
  };
}

function sniffImageType(bytes) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }

  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { ext: "gif", contentType: "image/gif" };
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }

  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (brand === "avif" || brand === "avis") {
      return { ext: "avif", contentType: "image/avif" };
    }
  }

  return null;
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function normalizePathPrefix(prefix) {
  if (!prefix) {
    return "";
  }

  return prefix.replace(/^\/+|\/+$/g, "");
}

function normalizeRequestPath(path) {
  const normalized = normalizePathPrefix(path);
  return normalized ? `/${normalized}` : "/";
}

function resolvePublicBaseUrl(requestUrl, env) {
  if (env.PUBLIC_BASE_URL) {
    return normalizeBaseUrl(env.PUBLIC_BASE_URL);
  }

  return normalizeBaseUrl(requestUrl.origin);
}

function getPublicObjectKey(pathname, publicPathPrefix) {
  if (!publicPathPrefix) {
    return pathname.replace(/^\/+/, "");
  }

  const prefixPath = `/${publicPathPrefix}/`;
  if (!pathname.startsWith(prefixPath)) {
    return null;
  }

  return pathname.slice(prefixPath.length);
}

function generateRequestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestPath = normalizeRequestPath(env.API_PATH_PREFIX);
    const publicPathPrefix = normalizePathPrefix(env.PUBLIC_PATH_PREFIX || "");

    if (url.pathname === requestPath) {
      if (request.method !== "POST") {
        return response("method not allowed\n", 405);
      }

      const auth = parseBasicAuth(request.headers.get("Authorization"));
      if (!auth || auth.user !== env.BASIC_USER || auth.pass !== env.BASIC_PASS) {
        return unauthorized();
      }

      const body = await request.arrayBuffer();
      if (body.byteLength === 0) {
        return response("empty body\n", 400);
      }

      const fileInfo = sniffImageType(new Uint8Array(body));
      if (!fileInfo) {
        return response("unsupported file type\n", 400);
      }

      const fileName = `${generateRequestId()}.${fileInfo.ext}`;
      const key = publicPathPrefix ? `${publicPathPrefix}/${fileName}` : fileName;

      await env.IMAGES.put(key, body, {
        httpMetadata: {
          contentType: fileInfo.contentType,
        },
      });

      return response(`${resolvePublicBaseUrl(url, env)}/${key}\n`);
    }

    const objectKey = getPublicObjectKey(url.pathname, publicPathPrefix);
    if (objectKey) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return response("method not allowed\n", 405);
      }

      const object = await env.IMAGES.get(objectKey);
      if (!object) {
        return notFound();
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      if (request.method === "HEAD") {
        return new Response(null, { headers });
      }

      return new Response(object.body, { headers });
    }

    return notFound();
  },
};
