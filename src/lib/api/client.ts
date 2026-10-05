import { buildApiUrl, type ApiParams } from './urls';

function errorMessage(body: unknown): string | undefined {
    if (typeof body === 'string') return body || undefined;
    if (typeof body !== 'object' || body === null) return;
    if ('detail' in body && typeof body.detail === 'string' && body.detail) return body.detail;
    if ('title' in body && typeof body.title === 'string') return body.title;
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: unknown,
        message?: string
    ) {
        super(message ?? errorMessage(body) ?? `SAMonitor API error: ${status}`);
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
    method?: 'GET' | 'POST';
    /** JSON request body. */
    body?: unknown;
    responseType?: 'json' | 'text';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildApiUrl(path, options.params);

    let res: Response;
    try {
        const init: RequestInit = { method: options.method ?? 'GET', signal: options.signal };
        if (options.body !== undefined) {
            init.headers = { 'Content-Type': 'application/json' };
            init.body = JSON.stringify(options.body);
        }
        res = await fetch(url, init);
    } catch (e) {
        throw new NetworkError(e);
    }

    if (res.status === 204) {
        // GetServerByIP returns 204 for an unknown address.
        throw new ApiError(204, null, 'Resource not found.');
    }

    if (!res.ok) {
        let body: unknown = null;
        try {
            const text = await res.text();
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
        } catch {
            // The response body could not be read.
        }
        throw new ApiError(res.status, body);
    }

    return (options.responseType === 'text' ? await res.text() : await res.json()) as T;
}
