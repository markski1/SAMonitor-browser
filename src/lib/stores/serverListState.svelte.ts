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
let serverSnapshot: Server[] = [];

function filtersKey(f: ServerFilters): string {
    return JSON.stringify(f);
}

export async function loadPage(
    pageToLoad: number,
    replace: boolean,
    f: ServerFilters
): Promise<void> {
    const key = filtersKey(f);
    if (!replace) {
        if (serverListState.loading || key !== serverListState.lastLoadedKey) return;
        showPage(pageToLoad);
        return;
    }

    currentRequest?.abort();
    const controller = new AbortController();
    currentRequest = controller;

    serverListState.loading = true;
    serverListState.error = null;
    serverListState.servers = [];
    serverListState.expandedId = null;
    serverListState.lastLoadedKey = '';
    serverListState.page = 0;
    serverListState.hasMore = true;
    serverSnapshot = [];

    try {
        const servers = await getFilteredServers(
            {
                name: f.name || undefined,
                gamemode: f.gamemode || undefined,
                language: f.language || undefined,
                showEmpty: f.showEmpty,
                hideRoleplay: f.hideRoleplay,
                requireSampcac: f.requireSampcac,
                order: f.order
            },
            controller.signal
        );

        if (controller.signal.aborted || currentRequest !== controller) return;

        const seen = new Set<number>();
        serverSnapshot = servers.filter(server => {
            if (seen.has(server.id)) return false;
            seen.add(server.id);
            return true;
        });
        serverListState.lastLoadedKey = key;
        showPage(pageToLoad);
    } catch (e) {
        if (controller.signal.aborted || currentRequest !== controller) return;

        const message =
            e instanceof NetworkError
                ? 'There was a network error reaching the SAMonitor API. Please try again in a moment.'
                : e instanceof ApiError
                  ? 'There was an error fetching servers from the SAMonitor API. This might be a server issue, please try again in a few minutes. (https://status.markski.ar/)'
                  : 'Unexpected error.';

        serverListState.error = message;
    } finally {
        if (currentRequest === controller) {
            serverListState.loading = false;
            currentRequest = null;
        }
    }
}

function showPage(page: number): void {
    serverListState.servers = serverSnapshot.slice(0, (page + 1) * PAGE_SIZE);
    serverListState.page = page;
    serverListState.hasMore = serverListState.servers.length < serverSnapshot.length;
}

/**
 * Clear the server list back to its initial state. Used when the user
 * explicitly navigates to the "servers" sidebar link, so they get a fresh
 * page (no search, no expanded card) rather than their previous state.
 */
export function resetServerListState(): void {
    currentRequest?.abort();
    currentRequest = null;
    serverSnapshot = [];

    serverListState.servers = [];
    serverListState.page = 0;
    serverListState.loading = false;
    serverListState.error = null;
    serverListState.hasMore = true;
    serverListState.expandedId = null;
    serverListState.lastLoadedKey = '';
}

export { filtersKey, PAGE_SIZE };
