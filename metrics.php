<?php
    include 'logic/layout.php';
    include 'view/bits/fragments.php';

    PageHeader("metrics");

    // if load_table or load_graph parameter is set, only return that.
    // this allows for two things:
    //     - External embedding of the table or graph by any 3rd party who wants it.
    //     - Making the main page load faster. HTMX calls this page again with this parameter to get the table without delaying the main page load.
    if (isset($_GET['load_table'])) {
        // get data for one week
        $metrics = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetGlobalMetrics?hours=168"), true);
        
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
?>

<div>
    <h2>Metrics</h3>
    <p>SAMonitor accounts for the total amount of servers and players a few times every hour, of every day.</p>
    <div class="innerContent">
        <form hx-target="#graph-cnt" hx-get="view/bits/fragments.php?type=metricsGraph" hx-trigger="change">
            <h3>Global 
                <select name="dataType" style="width: 6rem">
                    <option value=0>player</option>
                    <option value=1>server</option>
                    <option value=2>api hits</option>
                </select>
            metrics | 
                <select name="hours">
                    <option value=24>Last 24 hours</option>
                    <option value=72>Last 72 hours</option>
                    <option value=168>Last week</option>
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
        <h3>Server-Specific metrics</h3>
        <p>The same graphs are available in every server's page. Simply click "Show details" and then "All server information" where desired.</p>
    </div>
</div>

<script>
    document.title = "SAMonitor - metrics";
</script>

<?php PageBottom() ?>