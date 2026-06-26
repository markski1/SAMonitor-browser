<script lang="ts">
    import FilterForm from "$lib/components/FilterForm.svelte";
    import ServerList from "$lib/components/ServerList.svelte";
    import StatsBanner from "$lib/components/StatsBanner.svelte";
</script>

<svelte:head>
    <title>SAMonitor - Home</title>
    <meta
        name="description"
        content="San Andreas Multiplayer server monitor, for GTA SA-MP and open.mp"
    />
</svelte:head>

<div class="page-shell">
    <FilterForm />
    <StatsBanner />
    <ServerList />
</div>
