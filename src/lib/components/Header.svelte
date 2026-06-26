<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { resetFilters } from "$lib/stores/filters";
    import { resetServerListState } from "$lib/stores/serverListState.svelte";

    interface NavLink {
        href: string;
        label: string;
        /** When set, runs before navigation and is allowed to prevent it. */
        onClick?: (e: MouseEvent) => void;
    }

    function isActive(href: string): boolean {
        const path = page.url.pathname;
        if (href === "/") return path === "/";
        return path === href || path.startsWith(`${href}/`);
    }

    function handleServersClick(e: MouseEvent) {
        // Let the browser handle modified clicks (new tab, window, etc.) as usual.
        if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
        ) {
            return;
        }
        e.preventDefault();
        // Clear search/filter and reset the server list so the user gets a
        // fresh "servers" view rather than their previous one.
        resetFilters();
        resetServerListState();
        if (page.url.pathname !== "/") {
            goto("/");
        }
    }

    const links: NavLink[] = [
        { href: "/", label: "servers", onClick: handleServersClick },
        { href: "/about", label: "about" },
        { href: "/masterlist", label: "masterlist" },
        { href: "/statistics", label: "statistics" },
        { href: "/add", label: "add server" },
    ];
</script>

<header>
    <div class="headerContents">
        <div>
            <h1>SAMonitor</h1>
        </div>
        <div>
            {#each links as link, i (link.href)}
                <a
                    href={link.href}
                    class:active={isActive(link.href)}
                    onclick={link.onClick}>{link.label}</a
                >
                {#if i < links.length - 1}
                    <span class="separator">/&nbsp;</span>
                {/if}
            {/each}
        </div>
    </div>
</header>

<style>
    .active {
        color: var(--text);
        font-weight: 600;
    }
</style>
