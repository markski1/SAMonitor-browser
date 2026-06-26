<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { ApiError, NetworkError, getServerPlayers } from '$lib/api';
    import type { Player } from '$lib/types/server';

    interface Props {
        ip: string;
        count: number;
    }

    let { ip, count }: Props = $props();

    let players = $state<Player[] | null>(null);
    let error = $state<string | null>(null);

    async function load() {
        error = null;
        players = null;

        if (count > 100) {
            error =
                "There's more than 100 players in the server. Due to a SA-MP limitation, the player list cannot be fetched.";
            return;
        }
        if (count < 1) {
            error = 'No one is playing at the moment.';
            return;
        }

        try {
            players = await getServerPlayers(ip);
            if (players.length === 0) {
                error =
                    'Could not fetch players. Server might be empty, or SAMonitor might have difficulty querying it at the moment.';
            }
        } catch (e) {
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? 'Error fetching players.'
                    : 'Unexpected error.';
        }
    }

    onMount(() => {
        load();
    });

    $effect(() => {
        ip;
        count;
        untrack(() => load());
    });
</script>

{#if error}
    <p>{error}</p>
{:else if players}
    <table class="playersTable compactTable">
        <thead>
            <tr>
                <th class="players-id">Id</th>
                <th>Name</th>
                <th class="players-num">Score</th>
                <th class="players-num">Ping</th>
            </tr>
        </thead>
        <tbody>
            {#each players as player, i (player.id + '-' + i)}
                <tr>
                    <td class="players-id">{player.id}</td>
                    <td class="player-name">{player.name}</td>
                    <td class="players-num">{player.score}</td>
                    <td class="players-num">{player.ping}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <p>Loading player list...</p>
{/if}
