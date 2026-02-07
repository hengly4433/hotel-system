export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/api/proxy/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Trigger logout to clear cookies
      await fetch("/api/auth/logout", { method: "POST" });
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=session_expired";
      }
    }

    const data = await res.json().catch(() => null);
    const message = data?.message || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (res.status === 204) {
    return null as T;
  }
  const text = await res.text();
  if (!text) {
    return null as T;
  }
  return JSON.parse(text) as T;
}
