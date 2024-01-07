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
    <?=$online_servers?> servers online (<?=$total_servers?> total)<br>
    <?=$inhabited_servers?> servers with players, <?=$online_servers_omp?> running open.mp.<br>
    <?=$total_players?> playing right now!
</p>