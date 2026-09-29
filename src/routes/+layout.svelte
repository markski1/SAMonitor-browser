<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import "../app.css";
    import Header from "$lib/components/Header.svelte";
    import { onMount } from "svelte";
    import { getPageMetadata } from "$lib/metadata.js";
    import PageMetadata from "$lib/components/PageMetadata.svelte";

    let { children } = $props();
    const metadata = $derived(getPageMetadata(page.url.pathname, import.meta.env.VITE_SITE_URL));

    onMount(() => {
        document.querySelectorAll('[data-samonitor-preview]').forEach(tag => tag.remove());
    });
</script>

<PageMetadata {metadata} />
<Header />
<main id="main" class="opacity-trans">
    {#key page.url.pathname}
        <div class="page-transition" in:fade={{ duration: 200 }}>
            {@render children?.()}
        </div>
    {/key}
</main>

<style>
    .page-transition {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
    }

    @media (min-width: 900px) {
        .page-transition {
            justify-content: flex-start;
        }
    }
</style>
