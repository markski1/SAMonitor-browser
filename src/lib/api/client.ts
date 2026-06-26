import { browser } from '$app/environment';

const DEFAULT_BASE = 'https://sam.markski.ar/api';

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: unknown,
        message?: string
    ) {
        super(message ?? `SAMonitor API error: ${status}`);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor(cause: unknown) {
        super('Failed to reach the SAMonitor API.');
        this.name = 'NetworkError';
    }
}

function resolveBase(): string {
    // In the browser, prefer the build-time env var. SSR/prerender will also
    // resolve this once, but the static adapter will set it on the client.
    const fromEnv = import.meta.env.VITE_API_BASE;
    return (fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_BASE).replace(/\/$/, '');
}

export interface RequestOptions {
    /** Query string parameters. Values are encoded. */
    params?: Record<string, string | number | boolean | null | undefined>;
    signal?: AbortSignal;
}

function buildUrl(path: string, params: RequestOptions['params']): string {
    const base = resolveBase();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === null || value === undefined) continue;
            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildUrl(path, options.params);

    let res: Response;
    try {
        res = await fetch(url, { signal: options.signal });
    } catch (e) {
        if (!browser) {
            // During prerender we never expect to call the API; surface a
            // clearer message than "fetch failed".
            throw new NetworkError(e);
        }
        throw new NetworkError(e);
    }

    if (res.status === 204) {
        // The API uses 204 to mean "no resource" for some endpoints
        // (GetServerByIP, GetServerMetrics). Surface that explicitly.
        throw new ApiError(204, null, 'Resource not found.');
    }

    if (!res.ok) {
        let body: unknown = null;
        try {
            body = await res.json();
        } catch {
            try {
                body = await res.text();
            } catch {
                // ignore
            }
        }
        throw new ApiError(res.status, body);
    }

    return (await res.json()) as T;
}
