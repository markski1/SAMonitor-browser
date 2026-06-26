<script lang="ts">
    import { slide } from "svelte/transition";
    import type { Server } from "$lib/types/server";
    import { formatLastUpdated, parseDatetime } from "$lib/format/datetime";
    import { normalizeWebsiteUrl } from "$lib/format/website";
    import { prefetchServerPage } from "$lib/stores/serverPageCache.svelte";
    import CopyIpButton from "./CopyIpButton.svelte";
    import ConnectButton from "./ConnectButton.svelte";

    interface Props {
        server: Server;
        expanded?: boolean;
        onToggle?: () => void;
    }

    let { server, expanded = false, onToggle }: Props = $props();

    const lastUpdated = $derived(parseDatetime(server.lastUpdated));
    const lastUpdatedLabel = $derived(formatLastUpdated(lastUpdated));

    const lagcomp = $derived(server.lagComp === 1 ? "Enabled" : "Disabled");
    const software = $derived(server.isOpenMp === 1 ? "open.mp" : "SA-MP");
    const website = $derived(normalizeWebsiteUrl(server.website));

    /** The address to display and use for the connect link. Falls back to the
     * id if the API didn't include `ipAddr` on this response. */
    const ipAddress = $derived(server.ipAddr ?? String(server.id));

    /** Preload the server's detail page data as soon as the card is expanded
     * (or the link is hovered/focused) so navigating to "All information"
     * is instant. */
    function preload() {
        prefetchServerPage(ipAddress);
    }

    $effect(() => {
        if (expanded) preload();
    });
</script>

<div class="server" class:expanded>
    <div
        class="server-header"
        role="button"
        tabindex={expanded ? -1 : 0}
        onclick={onToggle}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle?.();
            }
        }}
    >
        <div class="server-row">
            <span class="server-title">{server.name}</span>
            <span class="server-count"
                >{server.playersOnline} / {server.maxPlayers}</span
            >
        </div>
        <div class="server-subrow">
            <span class="server-mode">{server.gameMode}</span>
            <span class="server-lang">{server.language}</span>
        </div>
    </div>
    {#if expanded}
        <div class="server-detail-block" transition:slide={{ duration: 200 }}>
            <div class="server-detail-meta">
                <span class="ipAddr" id={`ipAddr${server.id}`}>{ipAddress}</span
                >
                <span class="server-software">{software}</span>
            </div>
            <div class="server-actions">
                <table class="serverDetailsTable compactTable">
                    <tbody>
                        <tr>
                            <td><b>Website</b></td>
                            <td
                                ><a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer">{website}</a
                                ></td
                            >
                        </tr>
                        <tr>
                            <td><b>Lag compensation</b></td>
                            <td>{lagcomp}</td>
                        </tr>
                        <tr>
                            <td><b>Version</b></td>
                            <td>{server.version}</td>
                        </tr>
                        <tr>
                            <td><b>Checked</b></td>
                            <td>{lastUpdatedLabel}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="server-button-row">
                    <a
                        href={`/server/${ipAddress}`}
                        onmouseenter={preload}
                        onfocus={preload}
                    >
                        <button>All information</button>
                    </a>
                    <CopyIpButton
                        ip={ipAddress}
                        buttonId={`copyButton${server.id}`}
                    />
                    <ConnectButton ip={ipAddress} />
                </div>
            </div>
        </div>
    {/if}
</div>
