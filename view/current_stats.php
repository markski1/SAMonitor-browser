<?php
    try {
        $ctx = stream_context_create(array('http'=>
            array(
                'timeout' => 5,
            )
        ));

        $success = @$globalStats = json_decode(file_get_contents("http://127.0.0.1:42069/api/GetGlobalStats", false, $ctx), true);

        if (!$success) {
            throw new ErrorException('Failure to connect to the API.', 0, 0, 0);
        }

        $total_servers = number_format($globalStats['serversTracked']);
        $online_servers = number_format($globalStats['serversOnline']);
        $inhabited_servers = number_format($globalStats['serversInhabited']);
        $online_servers_omp = number_format($globalStats['serversOnlineOMP']);
        $total_players = number_format($globalStats['playersOnline']);
    }
    catch (Exception $ex) {
        echo '<p>Failed to load stats.</p>';
        exit;
    }
?>

<p>
    <b><?=$online_servers?></b> servers online (<b><?=$total_servers?></b> total)<br>
    <b><?=$inhabited_servers?></b> servers have players, <b><?=$online_servers_omp?></b> have open.mp.<br>
    <b><?=$total_players?></b> are playing right now!
</p>