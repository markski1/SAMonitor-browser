<?php

/*
 *
 *  FRAGMENT REQUEST HANDLING
 *
 */

if (isset($_GET['type'])) {
    if ($_GET['type'] == 'details') {
        $server = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetServerByIP?ip_addr=".urlencode($_GET['ip_addr'])), true);

        DrawServer($server, true);
    }

    if ($_GET['type'] == 'listing') {
        $server = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetServerByIP?ip_addr=".urlencode($_GET['ip_addr'])), true);

        DrawServer($server, false);
    }

    if ($_GET['type'] == 'serverGraph') {
        DrawServerGraph($_GET['ip_addr'], $_GET['hours']);
    }

    if ($_GET['type'] == 'metricsGraph') {
        $dataType = $_GET['dataType'] ?? 0;
        DrawMetricsGraphs($dataType, $_GET['hours']);
    }
}


/*
 *
 *  START FRAGMENTS
 *
 */


function DrawServer($server, $details = false) {
    $server = array_map('htmlspecialchars', $server);

    if ($server['website'] != "Unknown") {
        $website = '<a href="'.$server['website'].'">'.$server['website'].'</a>';
    }
    else {
        $website = "No website specified.";
    }

    $lagcomp = $server['lagComp'] == 1 ? "Enabled" : "Disabled";
    $last_updated = strtotime($server['lastUpdated']);
?>
    <h3 style="margin: 0 0 .4rem"><?=$server['name']?></h3>
    <table style="width: 100%" class="serverInfo">
        <tr>
            <td style="width: 50%"><b><?=$server['gameMode']?></b></td><td><b>Language</b>: <?=$server['language']?></td>
        </tr>
        <tr>
            <td><b>Players</b>: <?=$server['playersOnline']?> / <?=$server['maxPlayers']?></td>
        </tr>
    </table>

    <?php if ($details) { ?>
        <div style="margin-bottom: 0.75rem;">
            <h3 style="margin: 1rem .2rem .4rem">Details</h3>
            <table class="serverDetailsTable">
                <tr>
                    <td><b>Map</b></td><td><?=$server['mapName']?></td>
                </tr>
                <tr>
                    <td><b>Lag compensation</b></td><td><?=$lagcomp?></td>
                </tr>
                <tr>
                    <td><b>Version</b></td><td><?=$server['version']?></td>
                </tr>
                <tr>
                    <td><b>Website</b></td><td><?=$website?></td>
                </tr>
                <tr>
                    <td><b>SAMPCAC</b></td><td><?=$server['sampCac']?></td>
                </tr>
                <tr>
                    <td><b>Last updated</b></td><td><?=timeSince($last_updated)?> ago</td>
                </tr>
            </table>
            <a hx-get="server.php?&ip_addr=<?=$server['ipAddr']?>" hx-target="#main" hx-push-url="true">
                <button style="width: 100%; margin-top: 1rem; font-size: 1.25rem">All server information</button>
            </a>
        </div>
    <?php } ?>

    <div style="float: left; margin-top: 0">
        <p class="ipAddr" id="ipAddr<?=$server['id']?>"><?=$server['ipAddr']?></p>
    </div>
    <div style="text-align: right; float: right; margin-top: 0">
        <?php if (!$details) { ?>
            <button hx-get="view/bits/fragments.php?type=details&ip_addr=<?=$server['ipAddr']?>">Details</button>
        <?php } ?>
        <button class="connectButton" id="copyButton<?=$server['id']?>" onclick="CopyAddress('ipAddr<?=$server['id']?>', 'copyButton<?=$server['id']?>')">Copy IP</button>
    </div>
    <div style="clear: both"></div>
<?php
}

function DrawServerGraph($serverIP, $hours) {
    $metrics = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetServerMetrics?hours={$hours}&ip_addr=".urlencode($serverIP)), true);

    if (count($metrics) < 3) {
        echo "<p>Not enough data for the activity graph, please check later.</p>";
        return;
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

    echo "
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
            });
        </script>
    ";
}


function DrawMetricsGraphs($dataType, $hours) {
    $dataSet = "";
    $timeSet = "";
    $first = true;

    $metrics = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetGlobalMetrics?hours=".$hours), true);
    // API provides data in descendent order, but we'd want to show it as a graph, so it should be ascending.
    $metrics = array_reverse($metrics);

    $lowest = 69420;
    $lowest_time = null;
    $highest = -1;
    $highest_time = null;

    $skip = true;

    switch ($dataType) {
        case 0:
            $getField = 'players';
            $datasetName = 'Players online';
            break;
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

    foreach ($metrics as $instant) {
        $humanTime = strtotime($instant['time']);

        // only specify the day if we're listing more than 24 hours.
        if ($hours > 24) {
            $humanTime = date("j/m H:i", $humanTime);
        }
        else $humanTime = date("H:i", $humanTime);

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

    echo "
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
            });
        </script>
        <p>The highest count was <span style='color: green'>{$highest}</span> at {$highest_time}, and the lowest was <span style='color: red'>{$lowest}</span> at {$lowest_time}</p>
    ";
}


/*
 *
 * DEPS
 *
 */

function timeSince($time) {
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
}
?>