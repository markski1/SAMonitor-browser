<script lang="ts">
    import { page } from "$app/state";
    import {
        ApiError,
        NetworkError,
        getServerByIp,
        getServerMetrics,
    } from "$lib/api";
    import { takeServerPagePrefetch } from "$lib/stores/serverPageCache.svelte";
    import type { Server } from "$lib/types/server";
    import type {
        ServerMetricInstant,
        ServerMetrics,
    } from "$lib/types/metrics";
    import { formatLastUpdated, parseDatetime } from "$lib/format/datetime";
    import { normalizeWebsiteUrl } from "$lib/format/website";
    import CopyIpButton from "$lib/components/CopyIpButton.svelte";
    import ConnectButton from "$lib/components/ConnectButton.svelte";
    import GraphPanel from "$lib/components/GraphPanel.svelte";
    import PlayerList from "$lib/components/PlayerList.svelte";

    const ip = $derived(page.params.ip ?? "");

    let server = $state<Server | null>(null);
    let metrics = $state<ServerMetrics | null>(null);
    let loadError = $state<string | null>(null);

    let graphHours = $state<number>(24);

    $effect(() => {
        // Re-fetch when the IP changes.
        ip;

        server = null;
        metrics = null;
        loadError = null;

        let cancelled = false;
        (async () => {
            // If the user expanded a card or hovered "All information" before
            // clicking, we likely already have the data on the way. Use it to
            // render immediately, then refresh in the background below.
            const cached = takeServerPagePrefetch(ip);
            if (cached) {
                try {
                    const hit = await cached;
                    if (cancelled) return;
                    server = hit.server;
                    metrics = hit.metrics;
                } catch {
                    // Prefetch failed; fall through to the normal fetch.
                }
            }

            try {
                const [s, m] = await Promise.all([
                    getServerByIp(ip),
                    getServerMetrics(ip, 168, true).then(computeMetrics),
                ]);
                if (cancelled) return;
                server = s;
                metrics = m;
            } catch (e) {
                if (cancelled) return;
                loadError =
                    e instanceof NetworkError || e instanceof ApiError
                        ? "Sorry, there was an error loading this server's information. It may not be in SAMonitor."
                        : "Unexpected error.";
            }
        })();

        return () => {
            cancelled = true;
        };
    });

    function computeMetrics(logged: ServerMetricInstant[]): ServerMetrics {
        const totalReqs = logged.length;
        let missed = 0;
        let totalPlayers = 0;
        for (const instant of logged) {
            if (instant.players < 0) missed += 1;
            else totalPlayers += instant.players;
        }
        const uptimePct =
            totalReqs > 0 && missed > 0
                ? 100 - (missed / totalReqs) * 100
                : 100;
        const success = totalReqs - missed;
        const avgPlayers = success > 0 ? totalPlayers / success : 0;
        return {
            loggedData: logged,
            totalReqs,
            missedReqs: missed,
            totalPlayers,
            uptimePct,
            avgPlayers,
        };
    }

    const lastUpdatedLabel = $derived(
        server ? formatLastUpdated(parseDatetime(server.lastUpdated)) : "",
    );
    const lagcomp = $derived(
        server && server.lagComp === 1 ? "Enabled" : "Disabled",
    );
    const software = $derived(
        server && server.isOpenMp === 1 ? "open.mp" : "SA-MP",
    );
    const website = $derived(server ? normalizeWebsiteUrl(server.website) : "");
</script>

<svelte:head>
    <title>SAMonitor - {server?.name ?? "Server"}</title>
    <meta
        name="description"
        content={`Information about the server ${server?.name ?? ""} in SAMonitor.`}
    />
</svelte:head>

<div class="page-shell">
    <h2>Server information</h2>
    {#if loadError}
        <p>{loadError}</p>
    {:else if server && metrics}
        <p class="server-page-title">{server.name}</p>
        <div class="server-page-grid">
            <div class="innerContent flexBox">
                <h3>Details</h3>
                <table class="serverDetailsTable compactTable">
                    <tbody>
                        <tr>
                            <td><b>Players</b></td>
                            <td>{server.playersOnline} / {server.maxPlayers}</td
                            >
                        </tr>
                        <tr>
                            <td><b>Gamemode</b></td>
                            <td>{server.gameMode}</td>
                        </tr>
                        <tr>
                            <td><b>Language</b></td>
                            <td>{server.language}</td>
                        </tr>
                        <tr>
                            <td><b>Map</b></td>
                            <td>{server.mapName}</td>
                        </tr>
                        <tr>
                            <td><b>Lag compensation</b></td>
                            <td>{lagcomp}</td>
                        </tr>
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
                            <td><b>Server software</b></td>
                            <td>{software}</td>
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
                <p class="server-summary">
                    Uptime during the last week: {metrics.uptimePct.toFixed(
                        2,
                    )}%<br />
                    <small>Based on measurements every 20 minutes.</small>
                </p>
                <div class="server-page-actions">
                    <p class="ipAddr" id="ipAddr">{ip}</p>
                    <div class="server-button-row">
                        <ConnectButton {ip} />
                        <CopyIpButton {ip} buttonId="copy-ip" />
                    </div>
                </div>
            </div>
            <div class="innerContent flexBox">
                <h3 class="inline-control-heading">
                    <label for="time-sector">Player activity</label>
                    <select id="time-sector" bind:value={graphHours}>
                        <option value={24}>Last 24 hours</option>
                        <option value={72}>Last 72 hours</option>
                        <option value={168}>Last week</option>
                        <option value={672}>last month</option>
                    </select>
                </h3>
                <div id="graph-cnt">
                    <GraphPanel {ip} hours={graphHours} />
                </div>
                <p>
                    <small>Times are UTC 0.</small>
                </p>
            </div>
            <div class="innerContent flexBox">
                <h3>Player list</h3>
                <PlayerList {ip} count={server.playersOnline} />
            </div>
        </div>
    {:else}
        <p>Loading server information...</p>
    {/if}
</div>
