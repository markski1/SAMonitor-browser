<?php
    include 'fragments.php';
    // if load_table or load_graph parameter is set, only return that.
    // this allows for two things:
    //     - External embedding of the table or graph by any 3rd party who wants it.
    //     - Making the main page load faster. HTMX calls this page again with this parameter to get the table without delaying the main page load.
    if (isset($_GET['load_table'])) {
        // get data for one week
        $metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGlobalMetrics?hours=168"), true);

        echo '<table style="width: 100%; border: 1px rgb(128, 128, 128) solid;">
                <tr><th>Time</th><th>Players online</th><th>Servers online</th><th>API Hits</th></tr>';

        foreach ($metrics as $instant) {
            $humanTime = strtotime($instant['time']);
            $humanTime = date("F jS H:i:s", $humanTime);
            echo "
                <tr>
                    <td>{$humanTime}</td>
                    <td>{$instant['players']}</td>
                    <td>{$instant['servers']}</td>
                    <td>{$instant['apiHits']}</td>
                </tr>
            ";
        }

        echo '</table>';
        exit;
    }



    try {
        $ctx = stream_context_create(array('http'=>
            array(
                'timeout' => 5,
            )
        ));

        $success = @$lang_metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetLanguageStats", false, $ctx), true);
        if (!$success) {
            throw new ErrorException('Failure to connect to the API.', 0, 0, 0);
        }

        $success = @$gm_metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGamemodeStats", false, $ctx), true);
        if (!$success) {
            throw new ErrorException('Failure to connect to the API.', 0, 0, 0);
        }
    }
    catch (Exception $ex) {
        echo "
            <div class='innerContent'>
                <h3>Error fetching metrics.</h3>
                <p>There was an error fetching the metrics data from the SAMonitor API.</p>
                <p>This might be a server issue, in which case, an automated script has already alerted me about this. Please try again in a few minutes.</p>
                <p><a href='https://status.markski.ar/'>Current status of my services</a></p>
            </div>
        ";
        exit;
    }

?>

<div class="innerContent">
    <form hx-target="#graph-cnt" hx-get="view/fragments.php?type=metricsGraph" hx-trigger="change">
        <h3>Global Activity -
            <select name="dataType" style="width: 6rem">
                <option value=0>players</option>
                <option value=1>servers</option>
                <option value=2>api hits</option>
            </select>
            in the
            <select name="hours">
                <option value=24>last 24 hours</option>
                <option value=72>last 72 hours</option>
                <option value=168>last week</option>
            </select>
        </h3>
    </form>
    <div id="graph-cnt" style="max-width: 100% !important">
        <?=DrawMetricsGraphs('players', 24)?>
    </div>
    <div style="margin-top: 1rem" hx-target="this">
        <input type="button" value="Show last week's stats in a table." hx-get="./view/metrics_body.php?load_table">
    </div>
    <p>
        <small>
            Times are UTC 0.
        </small>
    </p>
</div>
<div class="innerContent">
    <h3>Miscellaneous metrics</h3>
    <p>Amount of servers by language</p>
    <table style="width: 100%" id="language_table">
        <thead>
        <th>Language</th> <th>Servers</th> <th>Players</th>
        </thead>
        <tbody>
        <tr>  <td>Russian</td> <td><?=$lang_metrics['russian']['amount']?></td> <td><?=number_format($lang_metrics['russian']['players'])?></td> </tr>
        <tr>  <td>English</td> <td><?=$lang_metrics['english']['amount']?></td> <td><?=number_format($lang_metrics['english']['players'])?></td> </tr>
        <tr>  <td>Spanish</td> <td><?=$lang_metrics['spanish']['amount']?></td> <td><?=number_format($lang_metrics['spanish']['players'])?></td> </tr>
        <tr>  <td>Portuguese</td> <td><?=$lang_metrics['portuguese']['amount']?></td> <td><?=number_format($lang_metrics['portuguese']['players'])?></td> </tr>
        <tr>  <td>Romanian</td> <td><?=$lang_metrics['romanian']['amount']?></td> <td><?=number_format($lang_metrics['romanian']['players'])?></td> </tr>
        <tr>  <td>Misc. East Europe</td> <td><?=$lang_metrics['eastEuro']['amount']?></td> <td><?=number_format($lang_metrics['eastEuro']['players'])?></td> </tr>
        <tr>  <td>Misc. West Europe</td> <td><?=$lang_metrics['westEuro']['amount']?></td> <td><?=number_format($lang_metrics['westEuro']['players'])?></td> </tr>
        <tr>  <td>Misc. Asia</td> <td><?=$lang_metrics['asia']['amount']?></td> <td><?=number_format($lang_metrics['asia']['players'])?></td> </tr>
        </tbody>
    </table>
    <p><small>The other <?=$lang_metrics['other']['amount']?> (<?=number_format($lang_metrics['other']['players'])?>) servers don't have a defined language.</small></p>
    <p>Amount of servers by gamemode</p>
    <table style="width: 100%" id="gamemode_table">
        <thead>
        <th>Gamemode</th> <th>Servers</th> <th>Players</th>
        </thead>
        <tbody>
        <tr>  <td>Roleplay</td> <td><?=$gm_metrics['roleplay']['amount']?></td> <td><?=number_format($gm_metrics['roleplay']['players'])?></td> </tr>
        <tr>  <td>Deathmatch</td> <td><?=$gm_metrics['deathmatch']['amount']?></td> <td><?=number_format($gm_metrics['deathmatch']['players'])?></td> </tr>
        <tr>  <td>Race/Stunt/Drift</td> <td><?=$gm_metrics['raceStunt']['amount']?></td> <td><?=number_format($gm_metrics['raceStunt']['players'])?></td> </tr>
        <tr>  <td>Cops and Robbers</td> <td><?=$gm_metrics['cnr']['amount']?></td> <td><?=number_format($gm_metrics['cnr']['players'])?></td> </tr>
        <tr>  <td>Freeroam</td> <td><?=$gm_metrics['freeRoam']['amount']?></td> <td><?=number_format($gm_metrics['freeRoam']['players'])?></td> </tr>
        <tr>  <td>Survival</td> <td><?=$gm_metrics['survival']['amount']?></td> <td><?=number_format($gm_metrics['survival']['players'])?></td> </tr>
        <tr>  <td>Vehicle Simulation</td> <td><?=$gm_metrics['vehSim']['amount']?></td> <td><?=number_format($gm_metrics['vehSim']['players'])?></td> </tr>
        </tbody>
    </table>
    <p><small>The other <?=$gm_metrics['other']['amount']?> (<?=number_format($gm_metrics['other']['players'])?>) servers don't have a defined gamemode.</small></p>
    <p style="margin-top: 1rem">
        There seems to be a practice to use the 'Language' or 'Gamemode' fields for the name of the server rather than what they actually are. Server owners, please, this makes it harder for people to find your server.
    </p>
</div>

<script>
    // order the tables
    tables = [];

    tables[0] = document.getElementById("language_table");
    tables[1] = document.getElementById("gamemode_table");

    tables.forEach((table) => {
        const rows = Array.from(table.querySelectorAll("tr"));
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[1].textContent;
            const cellB = rowB.cells[1].textContent;

            return Number(cellB) - Number(cellA);
        });

        const tbody = table.querySelector("tbody");
        rows.forEach((row) => {
            tbody.appendChild(row);
        });
    })
</script>