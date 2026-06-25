<script lang="ts">
    import AddServerForm from '$lib/components/AddServerForm.svelte';
</script>

<svelte:head>
    <title>SAMonitor - Add server</title>
    <meta
        name="description"
        content="Here you can add your SA-MP or OMP server to SAMonitor."
    />
</svelte:head>

<div>
    <h2>Add server</h2>
    <p>SAMonitor is an open server list, and as such, anyone can add a server.</p>
    <AddServerForm />
    <div class="innerContent">
        <h3>Announce filterscript</h3>
        <p>
            If preferred, you can use our filterscript to automatically ensure your server is
            always in SAMonitor, even if your IP changes.
        </p>
        <p>
            Source code and compiled amx are available in
            <a target="_blank" href="https://github.com/markski1/SAMonitor/tree/main/Announce"
                >the Announce folder of the repository</a
            >.
        </p>
    </div>
</div>
