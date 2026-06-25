<script lang="ts">
    import type { Server } from '$lib/types/server';
    import { formatLastUpdated, parseDatetime } from '$lib/format/datetime';
    import { normalizeWebsiteUrl } from '$lib/format/website';
    import CopyIpButton from './CopyIpButton.svelte';
    import ConnectButton from './ConnectButton.svelte';

    interface Props {
        server: Server;
        /** Rendered with full details table. The home page uses a local toggle
         * to expand a card in place; the dedicated server page renders it
         * always-expanded. */
        details?: boolean;
    }

    let { server, details = false }: Props = $props();

    const lastUpdated = $derived(parseDatetime(server.lastUpdated));
    const lastUpdatedLabel = $derived(formatLastUpdated(lastUpdated));

    const lagcomp = $derived(server.lagComp === 1 ? 'Enabled' : 'Disabled');
    const software = $derived(server.isOpenMp === 1 ? 'open.mp' : 'SA-MP');
    const website = $derived(normalizeWebsiteUrl(server.website));

    /** The address to display and use for the connect link. Falls back to the
     * id if the API didn't include `ipAddr` on this response. */
    const ipAddress = $derived(server.ipAddr ?? String(server.id));
</script>

<div class="server" class:server_clickable={!details}>
    <div style="float: left;">
        <span style="color: #A0C0F0; font-weight: 700; font-size: 1.1rem">{server.name}</span><br />
    </div>
    <div style="text-align: right; float: right;">
        <span style="font-size: 1.1rem; font-weight: 700;"
            >{server.playersOnline} / {server.maxPlayers}</span
        ><br />
    </div>
    <div style="clear: both;"></div>
    <div style="float: left;">
        <p><span class="ipAddr" id={`ipAddr${server.id}`}>{ipAddress}</span></p>
    </div>
    <div style="text-align: right; float: right;">
        <span><b>Lang:</b> {server.language}</span>
    </div>
    {#if details}
        <div style="margin-bottom: 0.75rem;">
            <table class="serverDetailsTable">
                <tbody>
                    <tr>
                        <td><b>Gamemode</b></td>
                        <td>{server.gameMode}</td>
                    </tr>
                    <tr>
                        <td><b>Website</b></td>
                        <td><a href={website} target="_blank" rel="noopener noreferrer">{website}</a></td>
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
                        <td><b>SAMPCAC</b></td>
                        <td>{server.sampCac}</td>
                    </tr>
                    <tr>
                        <td><b>Checked</b></td>
                        <td>{lastUpdatedLabel}</td>
                    </tr>
                </tbody>
            </table>
            <a
                style="text-decoration: none; user-select: none;"
                href={`/server/${encodeURIComponent(ipAddress)}`}
            >
                <button style="margin-top: 1rem;">All information</button>
            </a>
            <CopyIpButton ip={ipAddress} buttonId={`copyButton${server.id}`} />
            <ConnectButton ip={ipAddress} />
        </div>
    {/if}
    <div style="clear: both"></div>
</div>
