function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function isUsableApiHost(hostname: string) {
  if (!hostname) {
    return false;
  }

  if (hostname === "0.0.0.0") {
    return false;
  }

  if (hostname.startsWith("198.18.") || hostname.startsWith("198.19.")) {
    return false;
  }

  return true;
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const resolvedHost = isUsableApiHost(hostname) ? hostname : "localhost";
    return `${protocol}//${resolvedHost}:8000/api/v1`;
  }

  return "http://localhost:8000/api/v1";
}

const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = RequestInit & {
  accessToken?: string | null;
};

export async function httpRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to API at ${API_BASE_URL}. Start backend on port 8000 and check CORS or VITE_API_BASE_URL.`,
      );
    }

    throw error;
  }

  if (!response.ok) {
    let details = "";

    try {
      const payload = (await response.json()) as { detail?: string; message?: string };
      details = payload.detail ?? payload.message ?? "";
    } catch {
      details = "";
    }

    throw new Error(details || `HTTP ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
