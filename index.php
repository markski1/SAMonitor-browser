<?php
    include 'logic/layout.php';
    PageHeader("San Andreas Multiplayer server monitor, for GTA SA-MP and open.mp");
?>

<div style="width: 100%; max-width: 70rem">
    <form class="filterBox" hx-get="./view/list_servers.php" hx-target="#server-list" hx-trigger="keyup, change, delay:0.5s">
        <h2>Filter options</h2>
        <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem; margin-top: .6rem;">
            <fieldset style="flex: 1 1;" class="flexBox">
                <table style="margin-top: .66rem;">
                    <tr>
                        <td><label for="name">Name:</label></td><td><input type="text" id="name" name="name" <?php if (isset($_GET['name'])) echo 'value="{}"'?>></td>
                    </tr>
                    <tr>
                        <td><label for="gamemode">Gamemode:</label></td><td><input type="text" id="gamemode" name="gamemode"></td>
                    </tr>
                    <tr>
                        <td><label for="language">Language:</label></td><td><input type="text" id="language" name="language"></td>
                    </tr>
                </table>
            </fieldset>
            <fieldset style="flex: 1 1;" class="flexBox">
                <label><input type="checkbox" name="hide_empty" checked> No empty servers</label><br />
                <label><input type="checkbox" name="hide_roleplay"> No roleplay servers</label><br />
                <label><input type="checkbox" name="require_sampcac"> SAMPCAC Required</label><br />
                <table style="width: 100%; margin-top: .75rem">
                    <tr>
                        <td>
                            <label for="order">Order by:</label>
                        </td>
                        <td style="text-align: right">
                            <select style="width: 100%" name="order" id="order">
                                <option value="none" selected>Don't order</option>
                                <option value="players">Player count</option>
                                <option value="ratio">Players/max ratio</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </fieldset>
        </div>
    </form>
    <div class="announce-banner" hx-get="../view/current_stats.php" hx-trigger="load" hx-target="this">
        <p>Loading current stats...</p>
    </div>
    <div id="server-list" hx-get="../view/list_servers.php?hide_empty" hx-trigger="load">
        <h1>Loading servers!</h1>
        <p>Please wait.</p><p>If you're using NoScript, you'll need to disable it.</p>
    </div>
</div>

<script>
    document.title = "SAMonitor - San Andreas Multiplayer server monitor, for GTA SA-MP and open.mp";
</script>

<?php PageBottom() ?>