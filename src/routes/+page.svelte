<script lang="ts">
    import FilterForm from '$lib/components/FilterForm.svelte';
    import ServerList from '$lib/components/ServerList.svelte';
    import StatsBanner from '$lib/components/StatsBanner.svelte';
    import { filters } from '$lib/stores/filters';
</script>

<svelte:head>
    <title>SAMonitor - Home</title>
    <meta
        name="description"
        content="San Andreas Multiplayer server monitor, for GTA SA-MP and open.mp"
    />
</svelte:head>

<div style="width: 100%; max-width: 70rem">
    <FilterForm />
    <StatsBanner />
    <ServerList filters={$filters} />
</div>
