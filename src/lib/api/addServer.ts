import { request } from './client';

export function addServer(ipAddr: string, signal?: AbortSignal) {
    // The upstream API accepts the addition via GET. Confirmed by the
    // existing server_list action in the legacy code, which does
    // `requests.get(f"http://127.0.0.1:42069/api/AddServer?ip_addr=...")`.
    return request<string>('/AddServer', { params: { ip_addr: ipAddr }, signal });
}
