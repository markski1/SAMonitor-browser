<?php
    include 'logic/layout.php';
    include 'view/fragments.php';

    // calculate week's uptime
    $metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetServerMetrics?hours=168&include_misses=1&ip_addr=".urlencode($_GET['ip_addr'])), true);

    $total_reqs = count($metrics);
    $req_miss = 0;
    $total_players_found = 0;

    foreach ($metrics as $instant) {
        if ($instant['players'] < 0) {
            $req_miss++;
        }
        else {
            $total_players_found += $instant['players'];
        }
    }

    $uptime = 100.0;
    $avg_players = 0.0;

    if ($total_reqs > 0) {
        if ($req_miss > 0) {
            $downtime = ($req_miss / $total_reqs) * 100;
            $uptime = 100 - $downtime;
        }
        
        $req_success = $total_reqs - $req_miss;
        if ($req_success > 0) {
            $avg_players = $total_players_found / $req_success;
        }
    }

    if (isset($_GET['ip_addr']) && strlen($_GET['ip_addr']) > 0) {
        $server = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetServerByIP?ip_addr=".urlencode($_GET['ip_addr'])), true);
    }
    
    if (isset($server)) {
        if ($server['website'] != "Unknown") {
            $website = '<a href="'.$server['website'].'">'.$server['website'].'</a>';
        }
        else {
            $website = "No website specified.";
        }

        $lagcomp = $server['lagComp'] == 1 ? "Enabled" : "Disabled";
        $last_updated = strtotime($server['lastUpdated']);
    }

    if (isset($server) && $server['name'] != null) {
        PageHeader($server['name'], "Information about the server {$server['name']} in SAMonitor.");
    }
    else {
        PageHeader("Invalid server");
    }

    if ($server['isOpenMp'] == 1) $server_software = "open.mp";
    else $server_software = "SA-MP";
?>

<div>
    <h2>Server information</h3>
    <?php
        if (!isset($server) || $server['name'] == null) {
            exit("<p>Sorry, there was an error loading this server's information. It may not be in SAMonitor.</p>");
        }
    ?>
    <p><?=$server['name']?></p>
    <div style="display: flex; flex-wrap: wrap; justify-content: start; gap: 1.5rem">
        <div class="innerContent flexBox">
            <h3>Details</h3>
            <table class="serverDetailsTable">
                <tr>
                    <td><b>Players</b></td><td><?=$server['playersOnline']?> / <?=$server['maxPlayers']?></td>
                </tr>
                <tr>
                    <td><b>Gamemode</b></td><td><?=$server['gameMode']?></td>
                </tr>
                <tr>
                    <td><b>Language</b></td><td><?=$server['language']?></td>
                </tr>
                <tr>
                    <td><b>Map</b></td><td><?=$server['mapName']?></td>
                </tr>
                <tr>
                    <td><b>Lag compensation</b></td><td><?=$lagcomp?></td>
                </tr>
                <tr>
                    <td><b>Website</b></td><td><?=$website?></td>
                </tr>
                <tr>
                    <td><b>Server software</b></td><td><?=$server_software?></td>
                </tr>
                <tr>
                    <td><b>Version</b></td><td><?=$server['version']?></td>
                </tr>
                <tr>
                    <td><b>SAMPCAC</b></td><td><?=$server['sampCac']?></td>
                </tr>
                <tr>
                    <td><b>Last updated</b></td><td><?=timeSince($last_updated)?> ago</td>
                </tr>
            </table>
            <p>Uptime during the last week: <?=number_format($uptime, 2)?>%<br/>Average players during last week: <?=number_format($avg_players, 2)?><br/><small>Based on measurements every 20 minutes.</small></p>
            <div style="margin-top: 1.5rem">
                <div style="float: left; margin-top: 0">
                    <p class="ipAddr" id="ipAddr<?=$server['id']?>"><?=$server['ipAddr']?></p>
                </div>
                <div style="text-align: right; float: right; margin-top: 0">
                    <a href="samp://<?=$server['ipAddr']?>"><button>Connect</button></a><button class="connectButton" id="copyButton<?=$server['id']?>" onclick="CopyAddress('ipAddr<?=$server['id']?>', 'copyButton<?=$server['id']?>')">Copy IP</button>
                </div>
            </div>
        </div>
        <div class="innerContent flexBox">
            <h3>Activity graph | 
                <select hx-target="#graph-cnt" name="hours" hx-get="view/fragments.php?type=serverGraph&ip_addr=<?=$server['ipAddr']?>">
                    <option value=24>Last 24 hours</option>
                    <option value=72>Last 72 hours</option>
                    <option value=168>Last week</option>
                </select>
            </h3>
            <div style='width: 100% !important' id="graph-cnt">
                <?=DrawServerGraph($_GET['ip_addr'], 24)?>
            </div>
            <p>
                <small>
                    Times are UTC 0.
                </small>
            </p>
        </div>
        <div class="innerContent flexBox">
            <h3>Player list</h3>
            <div hx-get="view/playerlist.php?ip_addr=<?=$server['ipAddr']?>&players=<?=$server['playersOnline']?>" hx-trigger="load">
                <p>Loading player list...</p>
            </div>
        </div>
    </div>
</div>

<script>
    document.title = "SAMonitor - <?=$server['name']?>"
    window.scrollTo(0, 0);
</script>

<?php
    PageBottom();
?>