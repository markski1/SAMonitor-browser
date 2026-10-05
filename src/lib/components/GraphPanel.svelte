<script lang="ts">
    import { untrack } from "svelte";
    import { ApiError, NetworkError, getServerMetrics } from "$lib/api";
    import {
        formatMetricTime,
        parseDatetime,
        type MetricTimeRange,
    } from "$lib/format/datetime";
    import Chart from "./Chart.svelte";

    interface Props {
        ip: string;
        hours: number;
    }

    let { ip, hours }: Props = $props();

    interface GraphData {
        labels: string[];
        data: (number | null)[];
        highest: number;
        highestTime: string | null;
        lowest: number;
        lowestTime: string | null;
        min: number;
        average: number;
    }

    let graph = $state<GraphData | null>(null);
    let error = $state<string | null>(null);

    function timeRange(h: number): MetricTimeRange {
        if (h >= 2016) return "long";
        if (h > 24) return "medium";
        return "short";
    }

    async function load(ip: string, hours: number, signal: AbortSignal) {
        error = null;
        graph = null;
        try {
            const metrics = await getServerMetrics(ip, hours, true, signal);
            if (signal.aborted) return;
            if (metrics.length < 3) {
                error =
                    "Not enough data for the activity graph, please check later.";
                return;
            }

            // The upstream API returns metrics newest-first, so we reverse
            // for an oldest-to-newest timeline, matching the original code.
            const ordered = [...metrics].reverse();
            const range = timeRange(hours);

            let highest = -1;
            let highestTime: string | null = null;
            let lowest = Number.POSITIVE_INFINITY;
            let lowestTime: string | null = null;
            let totalPlayers = 0;
            let counted = 0;

            const labels: string[] = [];
            const data: (number | null)[] = [];

            for (const instant of ordered) {
                const date = parseDatetime(instant.time);
                const human = formatMetricTime(date, range);

                if (instant.players > highest) {
                    highest = instant.players;
                    highestTime = human;
                }
                if (instant.players >= 0 && instant.players < lowest) {
                    lowest = instant.players;
                    lowestTime = human;
                }
                if (instant.players >= 0) {
                    totalPlayers += instant.players;
                    counted += 1;
                }

                labels.push(human);
                data.push(instant.players < 0 ? null : instant.players);
            }

            const average = counted > 0 ? totalPlayers / counted : 0;
            if (counted === 0) {
                error = "No responsive samples are available for this graph.";
                return;
            }
            graph = {
                labels,
                data,
                highest,
                highestTime,
                lowest,
                lowestTime,
                min: 0,
                average,
            };
        } catch (e) {
            if (signal.aborted) return;
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? "Error obtaining server metrics to build graph."
                    : "Unexpected error.";
        }
    }

    $effect(() => {
        const currentIp = ip;
        const currentHours = hours;
        const controller = new AbortController();
        untrack(() => load(currentIp, currentHours, controller.signal));
        return () => controller.abort();
    });
</script>

{#if error}
    <p>{error}</p>
{:else if graph}
    <Chart
        chartId={`server-graph-${ip}`}
        labels={graph.labels}
        data={graph.data}
        label="Players online"
        min={graph.min}
    />
    <p>
        Average players: {graph.average.toFixed(2)}
    </p>
    <p>
        The highest count was <span class="metric-high">{graph.highest}</span>
        at
        {graph.highestTime} and the lowest was
        <span class="metric-low">{graph.lowest}</span>
        at
        {graph.lowestTime}
    </p>
    <small>Empty spaces in the chart means the server did not respond.</small>
{:else}
    <p>Loading graph...</p>
{/if}
