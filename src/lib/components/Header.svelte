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
        { href: "/statistics", label: "statistics" },
        { href: "/api", label: "API" },
        { href: "/add", label: "add server" },
    ];
</script>

<header>
    <div class="headerContents">
        <h1>SAMonitor</h1>
        <nav aria-label="Main navigation">
            {#each links as link (link.href)}
                <a
                    href={link.href}
                    class:active={isActive(link.href)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    onclick={link.onClick}>{link.label}</a
                >
            {/each}
        </nav>
    </div>
</header>

<style>
    header { min-width: 0; padding-top: 1.5rem; }
    h1 { margin: 0; font-size: 1.85rem; font-weight: 700; }
    nav { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 1rem; }
    nav a { display: block; padding: 0.6rem 0.85rem; border-radius: 10px; color: var(--text-muted); font-size: 0.95rem; text-decoration: none; }
    nav a:hover { background: var(--surface-soft); color: var(--text); }
    nav a.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
    @media (min-width: 900px) {
        header { position: sticky; top: 3rem; align-self: start; margin-top: 3rem; padding-top: 0; }
        nav { flex-direction: column; gap: 0.35rem; margin-top: 1.5rem; }
    }
    @media (max-width: 480px) {
        nav a { padding: 0.55rem 0.65rem; font-size: 0.88rem; }
    }
</style>
