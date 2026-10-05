import { browser } from '$app/environment';
import { buildApiUrl, type ApiParams } from './urls';

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

export interface RequestOptions {
    /** Query string parameters. Values are encoded. */
    params?: ApiParams;
    signal?: AbortSignal;
    responseType?: 'json' | 'text';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildApiUrl(path, options.params);

    let res: Response;
    try {
        res = await fetch(url, { signal: options.signal });
    } catch (e) {
        // During prerender we never expect to call the API; surface a
        // clearer message than "fetch failed".
        if (!browser) throw new NetworkError(e);
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

    return (options.responseType === 'text' ? await res.text() : await res.json()) as T;
}
