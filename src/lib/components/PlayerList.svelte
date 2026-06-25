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
    <table style="width: 100%; border: 0;">
        <thead>
            <tr style="border: 1px rgb(128, 128, 128) solid">
                <th>Id</th>
                <th>Name</th>
                <th>Score</th>
                <th>Ping</th>
            </tr>
        </thead>
        <tbody>
            {#each players as player, i (player.id + '-' + i)}
                <tr>
                    <td style="width: 100px">{player.id}</td>
                    <td>{player.name}</td>
                    <td>{player.score}</td>
                    <td>{player.ping}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <p>Loading player list...</p>
{/if}
