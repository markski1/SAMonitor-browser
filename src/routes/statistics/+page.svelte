<script lang="ts">
    import GlobalGraphPanel from "$lib/components/GlobalGraphPanel.svelte";
    import StatsTables from "$lib/components/StatsTables.svelte";
    import { onMount } from "svelte";
    import {
        ApiError,
        NetworkError,
        getGamemodeStats,
        getGlobalMetrics,
        getLanguageStats,
    } from "$lib/api";
    import type {
        GamemodeStats,
        LanguageStats,
        GlobalMetric,
    } from "$lib/types/stats";
    import {
        parseDatetime,
        formatMetricTime,
        type MetricTimeRange,
    } from "$lib/format/datetime";

    type DataType = "players" | "servers" | "ompServers";

    let dataType = $state<DataType>("players");
    let hours = $state<number>(24);

    let languageStats = $state<LanguageStats | null>(null);
    let gamemodeStats = $state<GamemodeStats | null>(null);
    let tableMetrics = $state<GlobalMetric[] | null>(null);
    let tableError = $state<string | null>(null);
    let showTable = $state(false);

    let loadError = $state<string | null>(null);

    onMount(async () => {
        try {
            const [lang, gm] = await Promise.all([
                getLanguageStats(),
                getGamemodeStats(),
            ]);
            languageStats = lang;
            gamemodeStats = gm;
        } catch (e) {
            loadError =
                e instanceof NetworkError || e instanceof ApiError
                    ? "There was an error fetching the metrics data from the SAMonitor API. This might be a server issue, in which case, an automated script has already alerted me about this. Please try again in a few minutes. (https://status.markski.ar/)"
                    : "Unexpected error.";
        }
    });

    function rangeOf(h: number): MetricTimeRange {
        if (h >= 2016) return "long";
        if (h > 24) return "medium";
        return "short";
    }

    async function toggleTable() {
        if (showTable) {
            showTable = false;
            return;
        }
        showTable = true;
        if (tableMetrics) return;
        tableError = null;
        try {
            tableMetrics = await getGlobalMetrics(168);
        } catch (e) {
            tableError =
                e instanceof NetworkError || e instanceof ApiError
                    ? "Sorry, there was an error generating the table."
                    : "Unexpected error.";
        }
    }
</script>

<svelte:head>
    <title>SAMonitor - Statistics</title>
    <meta
        name="description"
        content="Statistics about SA-MP and open.mp servers"
    />
</svelte:head>

<div>
    <h2>Statistics</h2>
    <p>
        SAMonitor accounts for the total amount of servers and players a few
        times every hour, of every day.
    </p>
    <div>
        <div class="innerContent">
            <h3>
                Global Activity -
                <select bind:value={dataType} style="width: 6rem">
                    <option value="players">players</option>
                    <option value="servers">servers</option>
                    <option value="ompServers">open.mp servers</option>
                </select>
                in the
                <select bind:value={hours}>
                    <option value={24}>last 24 hours</option>
                    <option value={72}>last 72 hours</option>
                    <option value={168}>last week</option>
                    <option value={336}>last 2 weeks</option>
                    <option value={672}>last month</option>
                    <option value={2016}>last 3 months</option>
                    <option value={4032}>last 6 months</option>
                    <option value={8064}>last year</option>
                    <option value={16128}>last 2 years</option>
                </select>
            </h3>
            <div id="graph-cnt" style="max-width: 100% !important">
                <GlobalGraphPanel {hours} {dataType} />
            </div>
            <div style="margin-top: 1rem">
                <input
                    type="button"
                    value={showTable
                        ? "Hide weekly stats table."
                        : "Show last week's stats in a table."}
                    onclick={toggleTable}
                />
            </div>
            {#if showTable}
                {#if tableError}
                    <p>{tableError}</p>
                {:else if tableMetrics}
                    <table
                        class="compactTable statsTable"
                        style="margin-top: 1rem;"
                    >
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th class="num-col">Players online</th>
                                <th class="num-col">Servers online</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each tableMetrics as instant (instant.time)}
                                <tr>
                                    <td
                                        >{formatMetricTime(
                                            parseDatetime(instant.time),
                                            rangeOf(168),
                                        )}</td
                                    >
                                    <td class="num-col"
                                        >{instant.players.toLocaleString(
                                            "en-US",
                                        )}</td
                                    >
                                    <td class="num-col"
                                        >{instant.servers.toLocaleString(
                                            "en-US",
                                        )}</td
                                    >
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p>Loading table...</p>
                {/if}
            {/if}
            <p>
                <small>Times are UTC 0.</small>
            </p>
        </div>

        {#if loadError}
            <div class="innerContent">
                <h3>Error fetching metrics.</h3>
                <p>{loadError}</p>
            </div>
        {:else if languageStats && gamemodeStats}
            <StatsTables {languageStats} {gamemodeStats} />
        {/if}
    </div>
</div>
