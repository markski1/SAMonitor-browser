import type { Server } from '$lib/types/server';
import { ApiError, NetworkError, getFilteredServers } from '$lib/api';
import type { ServerFilters } from './filters';

const PAGE_SIZE = 40;

export interface ServerListState {
    servers: Server[];
    page: number;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    expandedId: number | null;
    lastLoadedKey: string;
}

export const serverListState = $state<ServerListState>({
    servers: [],
    page: 0,
    loading: false,
    error: null,
    hasMore: true,
    expandedId: null,
    lastLoadedKey: ''
});

/** Non-reactive: the in-flight request, so we can cancel it on reset/refresh. */
let currentRequest: AbortController | null = null;

function filtersKey(f: ServerFilters): string {
    return JSON.stringify(f);
}

export async function loadPage(
    pageToLoad: number,
    replace: boolean,
    f: ServerFilters
): Promise<void> {
    if (serverListState.loading) return;

    currentRequest?.abort();
    const controller = new AbortController();
    currentRequest = controller;

    serverListState.loading = true;
    serverListState.error = null;

    try {
        const servers = await getFilteredServers(
            {
                name: f.name || undefined,
                gamemode: f.gamemode || undefined,
                language: f.language || undefined,
                showEmpty: f.showEmpty,
                hideRoleplay: f.hideRoleplay,
                requireSampcac: f.requireSampcac,
                order: f.order,
                page: pageToLoad,
                pagingSize: PAGE_SIZE
            },
            controller.signal
        );

        if (controller.signal.aborted) return;

        if (replace) {
            serverListState.servers = servers;
            serverListState.expandedId = null;
        } else {
            serverListState.servers = [...serverListState.servers, ...servers];
        }
        serverListState.page = pageToLoad;
        serverListState.hasMore = servers.length === PAGE_SIZE;
        serverListState.loading = false;
    } catch (e) {
        if (controller.signal.aborted) return;

        const message =
            e instanceof NetworkError
                ? 'There was a network error reaching the SAMonitor API. Please try again in a moment.'
                : e instanceof ApiError
                  ? 'There was an error fetching servers from the SAMonitor API. This might be a server issue, please try again in a few minutes. (https://status.markski.ar/)'
                  : 'Unexpected error.';

        serverListState.loading = false;
        serverListState.error = message;
    }
}

/**
 * Clear the server list back to its initial state. Used when the user
 * explicitly navigates to the "servers" sidebar link, so they get a fresh
 * page (no search, no expanded card) rather than their previous state.
 */
export function resetServerListState(): void {
    currentRequest?.abort();
    currentRequest = null;

    serverListState.servers = [];
    serverListState.page = 0;
    serverListState.loading = false;
    serverListState.error = null;
    serverListState.hasMore = true;
    serverListState.expandedId = null;
    serverListState.lastLoadedKey = '';
}

export { filtersKey, PAGE_SIZE };
