<?php
    include 'logic/layout.php';
    PageHeader("San Andreas Multiplayer server monitor, for SA-MP and open.mp");

    $globalStats = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetGlobalStats"), true);

    $total_servers = $globalStats['serversTracked'];
    $online_servers = $globalStats['serversOnline'];
    $total_players = $globalStats['playersOnline'];
?>

<div class="filterContainer">
    <div class="filterBox">
        <form hx-get="./view/bits/list_servers.php" hx-target="#server-list">
            <h2>Filters</h2>
            <fieldset style="margin-top: .66rem">
                <h3 style="margin-bottom: 0.33rem">Search</h3>
                <table>
                    <tr>
                        <td><label for="name">Name:</label></td><td><input type="text" id="name" name="name" <?php if (isset($_GET['name'])) echo 'value="{}"'?>></td>
                    </tr>
                    <tr>
                        <td><label for="gamemode">Gamemode:</label></td><td><input type="text" id="gamemode" name="gamemode"></td>
                    </td>
                    <tr>
                        <td><label for="language">Language:</label></td><td><input type="text" id="language" name="language"></td>
                    </tr>
                </table>
            </fieldset>
            <fieldset style="margin-top: 1rem">
                <h3 style="margin-bottom: 0.33rem">Options</h3>
                <label><input type="checkbox" name="hide_empty" checked> No empty servers</label><br />
                <label><input type="checkbox" name="hide_roleplay"> No roleplay servers</label><br />
                <label><input type="checkbox" name="hide_russian"> No russian servers</label><br />
                <label><input type="checkbox" name="require_sampcac"> SAMPCAC Required</label><br />
            </fieldset>
            <table style="width: 100%; margin-top: .75rem">
                <tr>
                    <td>
                        <label for="order">Order by:</label>
                    </td>
                    <td style="text-align: right">
                        <select style="width: 100%" name="order" id="order">
                            <option value="none">Don't order</option>
                            <option value="players">Player count</option>
                            <option value="ratio" selected>Players/max ratio</option>
                        </select>
                    </td>
                </tr>
            </table>
            <div style="margin-top: 1rem; margin-bottom: 0; width: 10rem">
                <input type="submit" value="Apply filter" hx-indicator="#filter-indicator" />
                <img style="width: 2rem; vertical-align: middle" src="assets/loading.svg" id="filter-indicator" class="htmx-indicator" alt="Loading indicator" />
            </div>
        </form>
    </div>
    <p><?=$total_servers?> total servers tracked.</br>
    <?=$online_servers?> servers currently online.</br>
    <?=$total_players?> people playing right now.</p>
</div>
<div id="server-list" class="pageContent" hx-get="view/bits/list_servers.php?hide_empty" hx-trigger="load">
    <h1>Loading servers!</h1>
    <p>Please wait. If servers don't load in, SAMonitor might be having issues, please check in later!. Alternatively, if you're using NoScript, you'll need to disable it.</p>
</div>

<script>
    document.title = "SAMonitor - San Andreas Multiplayer server monitor, for SA-MP and open.mp";
</script>

<?php PageBottom() ?>