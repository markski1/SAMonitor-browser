<script lang="ts">
    import { untrack } from 'svelte';
    import { ApiError, NetworkError, getGlobalMetrics } from '$lib/api';
    import { formatMetricTime, parseDatetime, type MetricTimeRange } from '$lib/format/datetime';
    import Chart from './Chart.svelte';

    type DataType = 'players' | 'servers' | 'ompServers';

    interface Props {
        hours: number;
        dataType: DataType;
    }

    let { hours, dataType }: Props = $props();

    interface GraphData {
        labels: string[];
        data: number[];
        label: string;
        highest: number;
        highestTime: string | null;
        lowest: number;
        lowestTime: string | null;
        min: number;
    }

    let graph = $state<GraphData | null>(null);
    let error = $state<string | null>(null);

    function timeRange(h: number): MetricTimeRange {
        if (h >= 2016) return 'long';
        if (h > 24) return 'medium';
        return 'short';
    }

    function fieldFor(t: DataType): 'players' | 'servers' | 'ompServers' {
        return t;
    }

    function labelFor(t: DataType): string {
        switch (t) {
            case 'servers':
                return 'Servers online';
            case 'ompServers':
                return 'open.mp servers online';
            case 'players':
            default:
                return 'Players online';
        }
    }

    async function load(hours: number, dataType: DataType, signal: AbortSignal) {
        error = null;
        graph = null;
        try {
            const metrics = await getGlobalMetrics(hours, signal);
            if (signal.aborted) return;
            if (metrics.length === 0) {
                error = 'Not enough data for the activity graph, please check later.';
                return;
            }
            const ordered = [...metrics].reverse();

            const field = fieldFor(dataType);
            const range = timeRange(hours);

            let highest = -1;
            let highestTime: string | null = null;
            let lowest = Number.POSITIVE_INFINITY;
            let lowestTime: string | null = null;

            const labels: string[] = [];
            const data: number[] = [];

            for (const instant of ordered) {
                const date = parseDatetime(instant.time);
                const human = formatMetricTime(date, range);
                const value = instant[field];

                if (value > highest) {
                    highest = value;
                    highestTime = human;
                }
                if (value < lowest) {
                    lowest = value;
                    lowestTime = human;
                }

                labels.push(human);
                data.push(value);
            }

            // Match the original's quirky rounding: round min down to the
            // nearest 10, at one third of the lowest observed value.
            const rawMin = Math.floor(lowest / 3);
            const min = rawMin - (rawMin % 10);

            graph = {
                labels,
                data,
                label: labelFor(dataType),
                highest,
                highestTime,
                lowest,
                lowestTime,
                min
            };
        } catch (e) {
            if (signal.aborted) return;
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? 'Sorry, there was an error generating the graph.'
                    : 'Unexpected error.';
        }
    }

    $effect(() => {
        const currentHours = hours;
        const currentType = dataType;
        const controller = new AbortController();
        untrack(() => load(currentHours, currentType, controller.signal));
        return () => controller.abort();
    });
</script>

{#if error}
    <p>{error}</p>
{:else if graph}
    <Chart
        chartId="globalPlayersChart"
        labels={graph.labels}
        data={graph.data}
        label={graph.label}
        min={graph.min}
    />
    <p>
        The highest count was <span class="metric-high">{graph.highest}</span> at
        {graph.highestTime} and the lowest was <span class="metric-low">{graph.lowest}</span> at
        {graph.lowestTime}
    </p>
    <small>Empty spaces in the chart means the server did not respond.</small>
{:else}
    <p>Loading graph...</p>
{/if}
