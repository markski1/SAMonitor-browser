<script lang="ts">
    import { onDestroy } from 'svelte';

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
    ) => { destroy(): void };

    function getChartCtor(): ChartCtor | undefined {
        if (typeof window === 'undefined') return undefined;
        return (window as unknown as { Chart?: ChartCtor }).Chart;
    }

    function build() {
        const Chart = getChartCtor();
        if (!Chart || !canvas) return;

        const plainData = {
            labels: [...labels],
            datasets: [
                {
                    label,
                    data: [...data],
                    borderWidth: 1
                }
            ]
        };

        chartInstance?.destroy();
        chartInstance = new Chart(canvas, {
            type: 'line',
            options: {
                scales: {
                    y: { min }
                }
            },
            data: plainData
        });
    }

    onDestroy(() => {
        chartInstance?.destroy();
        chartInstance = null;
    });

    $effect(() => {
        // Read the canvas so the effect re-runs once it is bound.
        void canvas;
        labels;
        data;
        label;
        min;

        if (!canvas) return;

        build();
    });
</script>

<canvas id={chartId} bind:this={canvas} style="width: 60rem; max-width: 100%"></canvas>
