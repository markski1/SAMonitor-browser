<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { ApiError, NetworkError, getGlobalMetrics } from '$lib/api';
    import { formatMetricTime, type MetricTimeRange } from '$lib/format/datetime';
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

    async function load() {
        error = null;
        graph = null;
        try {
            const metrics = await getGlobalMetrics(hours);
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
                const date = new Date(instant.time);
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
            error =
                e instanceof NetworkError || e instanceof ApiError
                    ? 'Sorry, there was an error generating the graph.'
                    : 'Unexpected error.';
        }
    }

    onMount(() => {
        load();
    });

    $effect(() => {
        hours;
        dataType;
        untrack(() => load());
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
        The highest count was <span style="color: green">{graph.highest}</span> at
        {graph.highestTime} and the lowest was <span style="color: red">{graph.lowest}</span> at
        {graph.lowestTime}
    </p>
    <small>Empty spaces in the chart means the server did not respond.</small>
{:else}
    <p>Loading graph...</p>
{/if}
