const TOKEN_KEY = "customer_access_token";

export function getCustomerToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function buildAuthHeaders(): Record<string, string> {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
