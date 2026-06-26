import type { Server } from '$lib/types/server';
import { request } from './client';

export interface GetFilteredServersParams {
    name?: string;
    gamemode?: string;
    language?: string;
    showEmpty?: boolean;
    hideRoleplay?: boolean;
    requireSampcac?: boolean;
    order?: 'none' | 'players' | 'ratio';
    page?: number;
    pagingSize?: number;
}

export function getFilteredServers(params: GetFilteredServersParams = {}, signal?: AbortSignal) {
    return request<Server[]>('/GetFilteredServers', {
        params: {
            name: params.name,
            gamemode: params.gamemode,
            language: params.language,
            show_empty: params.showEmpty ? 1 : undefined,
            hide_roleplay: params.hideRoleplay ? 1 : undefined,
            require_sampcac: params.requireSampcac ? 1 : undefined,
            order: params.order,
            page: params.page,
            paging_size: params.pagingSize
        },
        signal
    });
}

export function getServerByIp(ipAddr: string, signal?: AbortSignal) {
    return request<Server>('/GetServerByIP', { params: { ip_addr: ipAddr }, signal });
}
