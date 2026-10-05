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
                    borderWidth: 2,
                    borderColor: '#a8c7fa',
                    backgroundColor: 'rgba(168, 199, 250, 0.06)',
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 12
                }
            ]
        };

        chartInstance?.destroy();
        chartInstance = new Chart(canvas, {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a7afb8', maxRotation: 0, autoSkipPadding: 20 },
                        border: { color: 'rgba(255, 255, 255, 0.08)' }
                    },
                    y: {
                        min,
                        ticks: { color: '#a7afb8' },
                        grid: { color: 'rgba(255, 255, 255, 0.06)' },
                        border: { display: false }
                    }
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

<div class="chart-frame">
    <canvas id={chartId} bind:this={canvas} aria-label={label}></canvas>
</div>

<style>
    .chart-frame { position: relative; width: 100%; min-width: 0; height: clamp(14rem, 28vw, 22rem); }
</style>
