export type ApiParams = Record<string, string | number | boolean | null | undefined>;

export const apiBase = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

export function buildApiUrl(path: string, params?: ApiParams): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== null && value !== undefined) query.set(key, String(value));
    }
    const suffix = query.size ? `?${query}` : '';
    return `${apiBase}${cleanPath}${suffix}`;
}
