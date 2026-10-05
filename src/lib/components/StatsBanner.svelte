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
        <div class="stats-summary">
            <div><span class="stat-value">{formatThousands(stats.playersOnline)}</span><span class="stat-label">Players online</span></div>
            <div><span class="stat-value">{formatThousands(stats.serversOnline)}</span><span class="stat-label">Servers online</span></div>
            <div><span class="stat-value">{formatThousands(stats.serversOnlineOMP)}</span><span class="stat-label">open.mp servers</span></div>
        </div>
        <p class="stats-caption">{formatThousands(stats.serversTracked)} tracked · {formatThousands(stats.serversInhabited)} with players</p>
    {:else}
        <p>Loading stats...</p>
    {/if}
</div>
