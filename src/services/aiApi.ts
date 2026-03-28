import axios from 'axios';

function resolveBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8000';

  if (import.meta.env.VITE_AI_API_BASE_URL) {
    return import.meta.env.VITE_AI_API_BASE_URL.replace(/\/+$/, '');
  }

  const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseApiUrl) {
    const normalizedBaseApiUrl = baseApiUrl.replace(/\/+$/, '');
    return normalizedBaseApiUrl.endsWith('/ai')
      ? normalizedBaseApiUrl
      : `${normalizedBaseApiUrl}/ai`;
  }

  try {
    const storedBase = window.localStorage?.getItem('ai_api_base_url');
    if (storedBase) return storedBase.replace(/\/+$/, '');
  } catch {
    // ignore
  }

  return 'http://localhost:8000';
}

const aiApi = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

export default aiApi;
