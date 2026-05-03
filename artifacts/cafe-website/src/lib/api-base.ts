export const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const configuredApiOrigin = import.meta.env.VITE_API_ORIGIN as
  | string
  | undefined;

export const API_ORIGIN = configuredApiOrigin
  ? configuredApiOrigin.replace(/\/+$/, "")
  : "";

export function apiPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN || APP_BASE}${normalizedPath}`;
}
