import type { Player } from '$lib/types/server';
import { request } from './client';

export function getServerPlayers(ipAddr: string, signal?: AbortSignal) {
    return request<Player[]>('/GetServerPlayers', { params: { ip_addr: ipAddr }, signal });
}
