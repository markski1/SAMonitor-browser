<?php
    include 'fragments.php';

    // no sanitiztion is required on these GET parameters as these just call the public API.

    $filters = "?";

    if (isset($_GET['show_empty'])) {
        $filters .= "show_empty=1";
    }
    else {
        $filters .= "no_empty"; // this doesn't do anything, but it avoids having to deal with using ? instead of & elsewhere.
    }

    if (isset($_GET['hide_roleplay'])) {
        $filters .= "&hide_roleplay=1";
    }

    if (isset($_GET['require_sampcac'])) {
        $filters .= "&require_sampcac=1";
    }

    $order = $_GET['order'] ?? "ratio";
    $filters .= "&order=".$order;

    $page = $_GET['page'] ?? 0;
    $filters .= "&paging_size=20";

    if (isset($_GET['name']) && strlen($_GET['name']) > 0) {
        $filters .= "&name=".urlencode($_GET['name']);
    }

    if (isset($_GET['gamemode']) && strlen($_GET['gamemode']) > 0) {
        $filters .= "&gamemode=".urlencode($_GET['gamemode']);
    }

    if (isset($_GET['language']) && strlen($_GET['language']) > 0) {
        $filters .= "&language=".urlencode($_GET['language']);
    }

    $servers = json_decode(file_get_contents("http://gateway.markski.ar:42069/api/GetFilteredServers" . $filters . "&page=".$page), true);

    if (count($servers) == 0) {
        exit("No results.");
    }

    foreach ($servers as $server) {
        echo '<div hx-target="this" class="server">';
        DrawServer($server);
        echo '</div>';
    }

    if (Count($servers) == 20) {   
        echo '
            <div hx-target="this" style="margin: 3rem">
                <center><button hx-trigger="click" hx-get="./view/bits/list_servers.php'.$filters.'&page='.($page + 1).'" hx-swap="outerHTML">Load more</button></center>
            </div>
        ';
    }
?>