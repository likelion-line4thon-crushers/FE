/**
 * Derives a SockJS-compatible WebSocket URL from a raw ws/wss/http/https URL.
 * SockJS requires http(s), not ws(s).
 */
function toHttpUrl(input: string, path: string): string | null {
  try {
    const url = new URL(input, window.location.origin);
    const protocol =
      url.protocol === 'ws:' ? 'http:'
      : url.protocol === 'wss:' ? 'https:'
      : url.protocol;
    return `${protocol}//${url.host}${path}`;
  } catch {
    return null;
  }
}

export function deriveWsUrl(
  rawUrl: string | null | undefined,
  path: '/ws/presenter' | '/ws/audience',
): string {
  if (rawUrl) {
    const derived = toHttpUrl(rawUrl, path);
    if (derived) return derived;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return toHttpUrl(apiBase, path) ?? `http://localhost:8080${path}`;
}
