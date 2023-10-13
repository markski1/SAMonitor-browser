<?php
    include 'logic/layout.php';
    include 'view/fragments.php';

    PageHeader("metrics");

    // if load_table or load_graph parameter is set, only return that.
    // this allows for two things:
    //     - External embedding of the table or graph by any 3rd party who wants it.
    //     - Making the main page load faster. HTMX calls this page again with this parameter to get the table without delaying the main page load.
    if (isset($_GET['load_table'])) {
        // get data for one week
        $metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGlobalMetrics?hours=168"), true);
        
        echo '<table style="width: 100%; border: 1px gray solid;">
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
        $success = @$lang_metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetLanguageStats"), true);
        $success_2 = @$gm_metrics = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGamemodeStats"), true);

        if (!$success || !$success_2) {
            throw new ErrorException('Failure to connect to the API.', 0, 0, 0);
        }
    }
    catch (Exception $ex) {
        echo "
            <div>
                <h1>Error fetching metrics.</h1>
                <p>There was an error fetching the metrics data from the SAMonitor API.</p>
                <p>This might be a server issue, in which case, an automated script has already alerted me about this. Please try again in a few minutes.</p>
                <p><a href='https://status.markski.ar/'>Current status of my services</a></p>
            </div>
        ";
        exit;
    }

    $lang_total = array_sum($lang_metrics);
    foreach ($lang_metrics as $lang => $amount) {
        $lang_pct[$lang] = ($amount / $lang_total) * 100;
    }

    
    $gm_total = array_sum($gm_metrics);
    foreach ($gm_metrics as $gm => $amount) {
        $gm_pct[$gm] = ($amount / $gm_total) * 100;
    }
?>

<div>
    <h2>Metrics</h3>
    <p>SAMonitor accounts for the total amount of servers and players a few times every hour, of every day.</p>
    <div class="innerContent">
        </h3>
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
            <input type="button" value="Show last week's stats in a table." hx-get="./metrics.php?load_table">
        </div>
        <p>
            <small>
                Times are UTC 0.
            </small>
        </p>
    </div>
    <div class="innerContent">
        <h3>Miscelaneous metrics</h3>
        <p>Amount of servers by language</p>
        <table style="width: 100%" id="language_table">
            <thead>
                <th>Language</thg> <th>Amount</th> <th>Percentage</th>
            </thead>
            <tbody>
                <tr>  <td>Russian</td> <td><?=$lang_metrics['russian']?></td> <td><?=number_format($lang_pct['russian'], 2)?>%</td> </tr>
                <tr>  <td>English</td> <td><?=$lang_metrics['english']?></td> <td><?=number_format($lang_pct['english'], 2)?>%</td> </tr>
                <tr>  <td>Spanish</td> <td><?=$lang_metrics['spanish']?></td> <td><?=number_format($lang_pct['spanish'], 2)?>%</td> </tr>
                <tr>  <td>Portuguese</td> <td><?=$lang_metrics['portuguese']?></td> <td><?=number_format($lang_pct['portuguese'], 2)?>%</td> </tr>
                <tr>  <td>Romanian</td> <td><?=$lang_metrics['romanian']?></td> <td><?=number_format($lang_pct['romanian'], 2)?>%</td> </tr>
                <tr>  <td>Misc. East Europe</td> <td><?=$lang_metrics['eastEuro']?></td> <td><?=number_format($lang_pct['eastEuro'], 2)?>%</td> </tr>
                <tr>  <td>Misc. West Europe</td> <td><?=$lang_metrics['westEuro']?></td> <td><?=number_format($lang_pct['westEuro'], 2)?>%</td> </tr>
                <tr>  <td>Misc. Asia</td> <td><?=$lang_metrics['asia']?></td> <td><?=number_format($lang_pct['asia'], 2)?>%</td> </tr>
            </tbody>
        </table>
        <p><small>The other <?=$lang_metrics['other']?> (<?=number_format($lang_pct['other'], 2)?>%) servers don't have a defined language.</small></p>
        <p>Amount of servers by gamemode</p>
        <table style="width: 100%" id="gamemode_table">
            <thead>
                <th>Gamemode</thg> <th>Amount</th> <th>Percentage</th>
            </thead>
            <tbody>
                <tr>  <td>Roleplay</td> <td><?=$gm_metrics['roleplay']?></td> <td><?=number_format($gm_pct['roleplay'], 2)?>%</td> </tr>
                <tr>  <td>Deathmatch</td> <td><?=$gm_metrics['deathmatch']?></td> <td><?=number_format($gm_pct['deathmatch'], 2)?>%</td> </tr>
                <tr>  <td>Race/Stunt/Drift</td> <td><?=$gm_metrics['raceStunt']?></td> <td><?=number_format($gm_pct['raceStunt'], 2)?>%</td> </tr>
                <tr>  <td>Cops and Robbers</td> <td><?=$gm_metrics['cnr']?></td> <td><?=number_format($gm_pct['cnr'], 2)?>%</td> </tr>
                <tr>  <td>Freeroam</td> <td><?=$gm_metrics['freeRoam']?></td> <td><?=number_format($gm_pct['freeRoam'], 2)?>%</td> </tr>
                <tr>  <td>Survival</td> <td><?=$gm_metrics['survival']?></td> <td><?=number_format($gm_pct['survival'], 2)?>%</td> </tr>
                <tr>  <td>Vehicle Simulation</td> <td><?=$gm_metrics['vehSim']?></td> <td><?=number_format($gm_pct['vehSim'], 2)?>%</td> </tr>
            </tbody>
        </table>
        <p><small>The other <?=$gm_metrics['other']?> (<?=number_format($gm_pct['other'], 2)?>%) servers don't have a defined gamemode.</small></p>
        <p style="margin-top: 1rem">
            There seems to be a practice to use the 'Language' or 'Gamemode' fields for the name of the server rather than what they actually are. Server owners, please, this makes it harder for people to find your server.
        </p>
    </div>
</div>

<script>
    document.title = "SAMonitor - metrics";
    window.scrollTo(0, 0);

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

<?php PageBottom() ?>