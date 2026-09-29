<script lang="ts">
    import { untrack } from "svelte";
    import { ApiError, NetworkError, getServerPlayers } from "$lib/api";
    import type { Player } from "$lib/types/server";

    interface Props {
        ip: string;
        count: number;
    }

    let { ip, count }: Props = $props();

    let players = $state<Player[] | null>(null);
    let error = $state<string | null>(null);

    async function load(ip: string, count: number, signal: AbortSignal) {
        error = null;
        players = null;

        if (count > 100) {
            error =
                "There's more than 100 players in the server. Due to a SA-MP limitation, the player list cannot be fetched.";
            return;
        }
        if (count < 1) {
            error = "No one is playing at the moment.";
            return;
        }

        try {
            const result = await getServerPlayers(ip, signal);
            if (signal.aborted) return;
            players = result;
            if (players.length === 0) {
                error =
                    "Could not fetch players. Server might be empty, or SAMonitor might have difficulty querying it at the moment.";
            }
        } catch (e) {
            if (signal.aborted) return;
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? "Error fetching players."
                    : "Unexpected error.";
        }
    }

    $effect(() => {
        const currentIp = ip;
        const currentCount = count;
        const controller = new AbortController();
        untrack(() => load(currentIp, currentCount, controller.signal));
        return () => controller.abort();
    });
</script>

{#if error}
    <p>{error}</p>
{:else if players}
    <table class="playersTable compactTable">
        <thead>
            <tr>
                <th>Name</th>
                <th class="players-num">Score</th>
            </tr>
        </thead>
        <tbody>
            {#each players as player, i (player.id + "-" + i)}
                <tr>
                    <td class="player-name">{player.name}</td>
                    <td class="players-num">{player.score}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <p>Loading player list...</p>
{/if}
