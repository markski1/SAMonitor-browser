<script lang="ts">
    import { onDestroy, onMount, untrack } from 'svelte';

    interface Props {
        labels: string[];
        data: (number | null)[];
        label: string;
        min?: number;
        chartId: string;
    }

    let { labels, data, label, min = 0, chartId }: Props = $props();

    let canvas: HTMLCanvasElement | undefined = $state();
    let chartInstance: { destroy(): void } | null = null;

    // Chart.js is loaded globally via a <script> tag in app.html so we
    // reference it through `window` to avoid pulling in a type-only import
    // for the whole library.
    type ChartCtor = new (
        ctx: HTMLCanvasElement,
        config: Record<string, unknown>
    ) => { destroy(): void; update(): void };

    function getChartCtor(): ChartCtor | undefined {
        if (typeof window === 'undefined') return undefined;
        return (window as unknown as { Chart?: ChartCtor }).Chart;
    }

    function build() {
        const Chart = getChartCtor();
        if (!Chart || !canvas) return;

        chartInstance?.destroy();
        chartInstance = new Chart(canvas, {
            type: 'line',
            options: {
                scales: {
                    y: { min }
                }
            },
            data: {
                labels,
                datasets: [
                    {
                        label,
                        data,
                        borderWidth: 1
                    }
                ]
            }
        });
    }

    onMount(() => {
        build();
    });

    onDestroy(() => {
        chartInstance?.destroy();
        chartInstance = null;
    });

    // React to data/label changes after the initial mount.
    $effect(() => {
        // Touch all reactive deps so the effect re-runs when they change.
        labels;
        data;
        label;
        min;
        untrack(() => {
            // Only re-build once the chart has been created; onMount handles
            // the first build.
            if (chartInstance) build();
        });
    });
</script>

<canvas id={chartId} style="width: 60rem; max-width: 100%"></canvas>
