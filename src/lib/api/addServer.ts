import { request } from './client';

export function addServer(ipAddr: string, signal?: AbortSignal) {
    return request<string>('/AddServer', {
        params: { ip_addr: ipAddr },
        signal,
        responseType: 'text'
    });
}
