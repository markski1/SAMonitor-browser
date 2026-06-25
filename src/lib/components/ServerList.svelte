<script lang="ts">
    import type { Server } from '$lib/types/server';
    import { ApiError, NetworkError, getFilteredServers } from '$lib/api';
    import type { ServerFilters } from '$lib/stores/filters';
    import ServerCard from './ServerCard.svelte';

    interface Props {
        filters: ServerFilters;
    }

    let { filters }: Props = $props();

    const PAGE_SIZE = 20;

    type PageState = {
        servers: Server[];
        page: number;
        loading: boolean;
        error: string | null;
        hasMore: boolean;
    };

    let pageState: PageState = $state({
        servers: [],
        page: 0,
        loading: false,
        error: null,
        hasMore: true
    });

    /** ID of the card currently expanded in place; only one at a time, matching
     * the original HTMX `hx-swap="outerHTML"` behavior. */
    let expandedId: number | null = $state(null);

    /** Track the in-flight request so we can cancel it on filter change. */
    let currentRequest: AbortController | null = null;

    /** A serialized key of the filters we last loaded for, used to avoid
     * refetching when an unrelated part of the store changes. */
    let lastLoadedKey: string = $state('');

    function filtersKey(f: ServerFilters): string {
        return JSON.stringify(f);
    }

    async function loadPage(pageToLoad: number, replace: boolean, f: ServerFilters) {
        if (pageState.loading) return;

        currentRequest?.abort();
        const controller = new AbortController();
        currentRequest = controller;

        pageState = { ...pageState, loading: true, error: null };

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

            pageState = {
                servers: replace ? servers : [...pageState.servers, ...servers],
                page: pageToLoad,
                loading: false,
                error: null,
                hasMore: servers.length === PAGE_SIZE
            };
            if (replace) expandedId = null;
        } catch (e) {
            if (controller.signal.aborted) return;

            const message =
                e instanceof NetworkError
                    ? 'There was a network error reaching the SAMonitor API. Please try again in a moment.'
                    : e instanceof ApiError
                      ? 'There was an error fetching servers from the SAMonitor API. This might be a server issue, please try again in a few minutes. (https://status.markski.ar/)'
                      : 'Unexpected error.';

            pageState = { ...pageState, loading: false, error: message };
        }
    }

    function loadMore() {
        loadPage(pageState.page + 1, false, filters);
    }

    function toggleExpand(server: Server) {
        expandedId = expandedId === server.id ? null : server.id;
    }

    /** Reactive: refetch the first page whenever the filters change. */
    $effect(() => {
        const key = filtersKey(filters);
        if (key === lastLoadedKey) return;
        lastLoadedKey = key;
        loadPage(0, true, filters);
    });
</script>

{#if pageState.error}
    <center>
        <h1>Error fetching servers.</h1>
        <p>{pageState.error}</p>
        <p>
            <a href="https://status.markski.ar/" target="_blank" rel="noopener noreferrer"
                >Current status of my services</a
            >
        </p>
    </center>
{:else}
    <ul style="list-style: none; padding: 0; margin: 0;">
        {#each pageState.servers as server (server.id)}
            <li>
                {#if expandedId === server.id}
                    <ServerCard {server} details />
                {:else}
                    <div
                        class="server-shell"
                        onclick={() => toggleExpand(server)}
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleExpand(server);
                            }
                        }}
                        role="button"
                        tabindex="0"
                    >
                        <ServerCard {server} details={false} />
                    </div>
                {/if}
            </li>
        {/each}
    </ul>

    {#if pageState.hasMore && !pageState.error}
        <div style="margin: 3rem; width: 80%; text-align: center">
            <button onclick={loadMore} disabled={pageState.loading}>
                {pageState.loading ? 'Loading...' : 'Load more'}
            </button>
        </div>
    {/if}
{/if}

<style>
    .server-shell {
        display: block;
    }
</style>
