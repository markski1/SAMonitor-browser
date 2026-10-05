import { request } from './client';

export async function addServer(ipAddr: string, signal?: AbortSignal) {
    const result = await request<{ ipAddr: string; message: string }>('/AddServer', {
        method: 'POST',
        body: { ipAddr },
        signal
    });
    return result.message;
}
