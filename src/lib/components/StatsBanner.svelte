<script lang="ts">
    import { onMount } from 'svelte';
    import { ApiError, NetworkError, getGlobalStats } from '$lib/api';
    import type { GlobalStats } from '$lib/types/stats';
    import { formatThousands } from '$lib/format/number';

    let stats = $state<GlobalStats | null>(null);
    let error = $state<string | null>(null);

    onMount(async () => {
        try {
            stats = await getGlobalStats();
        } catch (e) {
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? 'Failed to load stats.'
                    : 'Unexpected error.';
        }
    });
</script>

<div class="announce-banner">
    {#if error}
        <p>{error}</p>
    {:else if stats}
        <p>
            <b>{formatThousands(stats.serversOnline)}</b> servers online (<b
                >{formatThousands(stats.serversTracked)}</b
            >total)<br />
            <b>{formatThousands(stats.serversInhabited)}</b> servers have players,
            <b>{formatThousands(stats.serversOnlineOMP)}</b> have open.mp.<br />
            <b>{formatThousands(stats.playersOnline)}</b> are playing right now!
        </p>
    {:else}
        <p>Loading stats...</p>
    {/if}
</div>
