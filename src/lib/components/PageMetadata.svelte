<script lang="ts">
    import { getMetaTags, type Metadata } from '$lib/metadata.js';

    let { metadata }: { metadata: Metadata } = $props();
</script>

<svelte:head>
    <title>{metadata.title}</title>
    <link rel="canonical" href={metadata.url} />
    {#each getMetaTags(metadata) as tag}
        <meta {...tag} />
    {/each}
</svelte:head>
