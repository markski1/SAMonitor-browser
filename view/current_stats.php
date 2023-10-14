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

        $total_servers = $globalStats['serversTracked'];
        $online_servers = $globalStats['serversOnline'];
        $online_servers_omp = $globalStats['serversOnlineOMP'];
        $total_players = $globalStats['playersOnline'];
    }
    catch (Exception $ex) {
        echo '<p>Failed to load stats.</p>';
        exit;
    }
?>

<p>
    <?=$total_servers?> total servers tracked.</br>
    <?=$online_servers?> servers currently online [<?=$online_servers_omp?> are open.mp].</br>
    <?=$total_players?> people playing right now.
</p>