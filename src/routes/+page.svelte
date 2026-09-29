<script lang="ts">
    import FilterForm from "$lib/components/FilterForm.svelte";
    import ServerList from "$lib/components/ServerList.svelte";
    import StatsBanner from "$lib/components/StatsBanner.svelte";
</script>

<div class="page-shell">
    <FilterForm />
    <StatsBanner />
    <ServerList />
</div>
