<script lang="ts">
    import { page } from '$app/state';

    const links = [
        { href: '/', label: 'servers' },
        { href: '/about', label: 'about' },
        { href: '/masterlist', label: 'masterlist' },
        { href: '/statistics', label: 'statistics' },
        { href: '/add', label: 'add server' }
    ];

    function isActive(href: string): boolean {
        const path = page.url.pathname;
        if (href === '/') return path === '/';
        return path === href || path.startsWith(`${href}/`);
    }
</script>

<header>
    <div class="headerContents">
        <div>
            <h1>SAMonitor</h1>
        </div>
        <div>
            {#each links as link, i (link.href)}
                <a href={link.href} class:active={isActive(link.href)}>{link.label}</a>
                {#if i < links.length - 1}
                    <span class="separator">&nbsp;/&nbsp;</span>
                {/if}
            {/each}
        </div>
    </div>
</header>

<style>
    .active {
        color: #a8c7fa;
    }
</style>
