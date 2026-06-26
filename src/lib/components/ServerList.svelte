<script lang="ts">
    import { fade } from "svelte/transition";
    import { filters } from "$lib/stores/filters";
    import {
        serverListState,
        loadPage,
        filtersKey,
        PAGE_SIZE,
    } from "$lib/stores/serverListState.svelte";
    import type { Server } from "$lib/types/server";
    import ServerCard from "./ServerCard.svelte";

    function loadMore() {
        loadPage(serverListState.page + 1, false, $filters);
    }

    function toggleExpand(server: Server) {
        serverListState.expandedId =
            serverListState.expandedId === server.id ? null : server.id;
    }

    /** Reactive: refetch the first page whenever the filters change. */
    $effect(() => {
        const f = $filters;
        const key = filtersKey(f);
        if (key === serverListState.lastLoadedKey) return;
        serverListState.lastLoadedKey = key;
        loadPage(0, true, f);
    });
</script>

{#if serverListState.error}
    <center>
        <h1>Error fetching servers.</h1>
        <p>{serverListState.error}</p>
        <p>
            <a
                href="https://status.markski.ar/"
                target="_blank"
                rel="noopener noreferrer">Current status of my services</a
            >
        </p>
    </center>
{:else}
    <ul style="list-style: none; padding: 0; margin: 0;">
        {#each serverListState.servers as server (server.id)}
            <li
                in:fade={{
                    duration: 250,
                    delay:
                        serverListState.expandedId === null
                            ? (serverListState.servers.indexOf(server) %
                                  PAGE_SIZE) *
                              25
                            : 0,
                }}
            >
                <ServerCard
                    {server}
                    expanded={serverListState.expandedId === server.id}
                    onToggle={() => toggleExpand(server)}
                />
            </li>
        {/each}
    </ul>

    {#if serverListState.hasMore && !serverListState.error}
        <div class="list-actions">
            <button onclick={loadMore} disabled={serverListState.loading}>
                {serverListState.loading ? "Loading..." : "Load more"}
            </button>
        </div>
    {/if}
{/if}

<style>
    .list-actions {
        margin: 1.5rem auto 0;
        width: 95%;
        text-align: center;
    }
</style>
