<?php

/*
 *
 *  FRAGMENT REQUEST HANDLING
 *
 */

if (isset($_GET['type'])) {
    if ($_GET['type'] == 'details') {
        $server = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetServerByIP?ip_addr=".urlencode($_GET['ip_addr'])), true);

        DrawServer($server, true);
    }

    if ($_GET['type'] == 'listing') {
        $server = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetServerByIP?ip_addr=".urlencode($_GET['ip_addr'])), true);

        DrawServer($server, false);
    }

    if ($_GET['type'] == 'serverGraph') {
        echo DrawServerGraph($_GET['ip_addr'], $_GET['hours']);
    }

    if ($_GET['type'] == 'metricsGraph') {
        $dataType = $_GET['dataType'] ?? 0;
        echo DrawMetricsGraphs($dataType, $_GET['hours']);
    }
}


/*
 *
 *  START FRAGMENTS
 *
 */


function DrawServer($server, $details = false): void
{
    $server = array_map('htmlspecialchars', $server);

    if ($server['website'] != "Unknown") {
        $website = '<a href="'.$server['website'].'">'.$server['website'].'</a>';
    }
    else {
        $website = "No website specified.";
    }

    $lag_comp = $server['lagComp'] == 1 ? "Enabled" : "Disabled";
    $last_updated = strtotime($server['lastUpdated']);

    if (!$details) echo '<div hx-swap="outerHTML" hx-target="this" hx-get="../view/fragments.php?type=details&ip_addr='.$server["ipAddr"].'" class="server server_clickable">';
    else echo '<div hx-swap="outerHTML" hx-target="this" class="server">';

    $server_name = trim($server['name']);
?>

        <div style="float: left;">
            <span style="color: #A0C0F0; font-weight: 700; font-size: 1.1rem"><?=$server_name?></span><br>
        </div>
        <div style="text-align: right; float: right;">
            <span style="font-size: 1.1rem; font-weight: 700;"><?=$server['playersOnline']?> / <?=$server['maxPlayers']?></span><br>
        </div>
        <div style="clear: both;"></div>
        <div style="float: left;">
            <p><span class="ipAddr" id="ipAddr<?=$server['id']?>"><?=$server['ipAddr']?></span></p>
        </div>
        <div style="text-align: right; float: right;">
            <span><b>Lang:</b> <?=$server['language']?></span>
        </div>
        <?php if ($details) { ?>
            <div style="margin-bottom: 0.75rem;">
                <table class="serverDetailsTable">
                    <tr>
                        <td><b>Gamemode</b></td><td><?=$server['gameMode']?></td>
                    </tr>
                    <tr>
                        <td><b>Website</b></td><td><?=$website?></td>
                    </tr>
                    <tr>
                        <td><b>Lag compensation</b></td><td><?=$lag_comp?></td>
                    </tr>
                    <tr>
                        <td><b>Version</b></td><td><?=$server['version']?></td>
                    </tr>
                    <tr>
                        <td><b>SAMPCAC</b></td><td><?=$server['sampCac']?></td>
                    </tr>
                    <tr>
                        <td><b>Checked</b></td><td><?=timeSince($last_updated)?> ago</td>
                    </tr>
                </table>
                <a style="text-decoration: none; user-select: none;" href="../server/<?=$server['ipAddr']?>" hx-get="../server/<?=$server['ipAddr']?>" hx-push-url="true" hx-target="#main" hx-swap="innerHTML" hx-indicator="#main">
                    <button style="margin-top: 1rem;">All information</button>
                </a>
                <button class="connectButton" id="copyButton<?=$server['id']?>" onclick="CopyAddress('ipAddr<?=$server['id']?>', 'copyButton<?=$server['id']?>')">Copy IP</button>
                <button hx-get="../view/fragments.php?type=listing&ip_addr=<?=$server["ipAddr"]?>">Close</button>
            </div>
        <?php } ?>
        <div style="clear: both"></div>
<?php
    echo '</div>';
}

function DrawServerGraph($serverIP, $hours): string
{
    $metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetServerMetrics?hours={$hours}&ip_addr=".urlencode($serverIP)), true);

    if (count($metrics) < 3) {
        return "<p>Not enough data for the activity graph, please check later.</p>";
    }

    $playerSet = "";
    $timeSet = "";
    $first = true;

    // API provides data in descendent order, but we'd want to show it ascendant since we're using a graph.
    $metrics = array_reverse($metrics);

    $lowest = 69420;
    $lowest_time = null;
    $highest = -1;
    $highest_time = null;

    $skip = true;

    foreach ($metrics as $instant) {
        $humanTime = strtotime($instant['time']);
        
        // only specify the day if we're listing more than 24 hours.
        if ($hours > 24) {
            $humanTime = date("j/m H:i", $humanTime);
        }
        else $humanTime = date("H:i", $humanTime);

        if ($instant['players'] < 0) $instant['players'] = 0;

        if ($instant['players'] > $highest) {
            $highest = $instant['players'];
            $highest_time = $humanTime;
        }
        if ($instant['players'] < $lowest) {
            $lowest = $instant['players'];
            $lowest_time = $humanTime;
        }

        if ($first) {
            $playerSet .= $instant['players'];
            $timeSet .= "'".$humanTime."'";
            $first = false;
        } 
        else {
            $playerSet .= ", ".$instant['players'];
            $timeSet .= ", '".$humanTime."'";
        }
    }

    return "
        <canvas id='globalPlayersChart' style='width: 100%'></canvas>
        <p>The highest player count was <span style='color: green'>{$highest}</span> at {$highest_time}, and the lowest was <span style='color: red'>{$lowest}</span> at {$lowest_time}</p>
    
        <script>
            new Chart(document.getElementById('globalPlayersChart'), {
                type: 'line',
                options: {
                    responsive: false,
                    scales: {
                        y: {
                            min: 0
                        }
                    }
                },
                data: {
                    labels: [{$timeSet}],
                    datasets: [
                        {
                            label: 'Players online',
                            data: [{$playerSet}],
                            borderWidth: 1
                        }
                    ]
                }
            })
        </script>
    ";
}


function DrawMetricsGraphs($dataType, $hours) {
    $dataSet = "";
    $timeSet = "";
    $first = true;

    $metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGlobalMetrics?hours=".$hours), true);
    // API provides data in descendent order, but we'd want to show it as a graph, so it should be ascending.
    $metrics = array_reverse($metrics);

    $lowest = 69420;
    $lowest_time = null;
    $highest = -1;
    $highest_time = null;

    switch ($dataType) {
        case 1:
            $getField = 'servers';
            $datasetName = 'Servers online';
            break;
        case 2:
            $getField = 'apiHits';
            $datasetName = 'API hits';
            break;
        default:
            $getField = 'players';
            $datasetName = 'Players online';
            break;
    }

    $total = 0;
    foreach ($metrics as $instant) {
        $humanTime = strtotime($instant['time']);

        // only specify the day if we're listing more than 24 hours.
        if ($hours > 24) {
            $humanTime = date("j/m H:i", $humanTime);
        }
        else $humanTime = date("H:i", $humanTime);

        $total += $instant[$getField];

        if ($instant[$getField] > $highest) {
            $highest = $instant[$getField];
            $highest_time = $humanTime;
        }
        if ($instant[$getField] < $lowest) {
            $lowest = $instant[$getField];
            $lowest_time = $humanTime;
        }

        if ($first) {
            $dataSet .= $instant[$getField];
            $timeSet .= "'".$humanTime."'";
            $first = false;
        } 
        else {
            $dataSet .= ", ".$instant[$getField];
            $timeSet .= ", '".$humanTime."'";
        }
    }

    // the lowest value in the graph's scale
    $min = intval($lowest / 3);
    $min = $min - $min % 10;

    $apihit_total = "";
    if ($dataType == 2) {
        $apihit_total = "<p>There were {$total} API hits in this timeframe.</p>";
    }

    return <<<HTML
        <canvas id='globalPlayersChart' style='width: 60rem; max-width: 100%'></canvas>
        <script>
            new Chart(document.getElementById('globalPlayersChart'),
            {
                type: 'line', 
                options: { 
                    responsive: true,
                    scales: {
                        y: {
                            min: {$min}
                        }
                    }
                },
                data: {
                    labels: [{$timeSet}],
                    datasets: [
                        {
                            label: '{$datasetName}',
                            data: [{$dataSet}],
                            borderWidth: 1
                        }
                    ]
                }
            })
        </script>
        <p>The highest count was <span style='color: green'>{$highest}</span> at {$highest_time}, and the lowest was <span style='color: red'>{$lowest}</span> at {$lowest_time}</p>
        {$apihit_total}
HTML;
}


/*
 *
 * DEPS
 *
 */

function timeSince($time): string
{
    $time = time() - $time; // to get the time since that moment
    $time = ($time<1)? 1 : $time;
    $tokens = array (
        31536000 => 'year',
        2592000 => 'month',
        604800 => 'week',
        86400 => 'day',
        3600 => 'hour',
        60 => 'minute',
        1 => 'second'
    );

    foreach ($tokens as $unit => $text) {
        if ($time < $unit) continue;
        $numberOfUnits = floor($time / $unit);
        return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'');
    }
    return "Unknown time.";
}
?>