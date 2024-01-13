<?php
    include 'fragments.php';

    // no sanitization is required on these GET parameters as these just call the public API.

    $filters = "?";

    if (!isset($_GET['hide_empty'])) {
        $filters .= "show_empty=1";
    }
    else {
        $filters .= "no_empty"; // this doesn't do anything, but it avoids having to deal with using ? instead of & elsewhere.
    }

    if (isset($_GET['hide_roleplay'])) {
        $filters .= "&hide_roleplay=1";
    }

    if (isset($_GET['hide_russian'])) {
        $filters .= "&hide_russian=1";
    }

    if (isset($_GET['require_sampcac'])) {
        $filters .= "&require_sampcac=1";
    }

    $order = $_GET['order'] ?? "none";
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

    try {
        $ctx = stream_context_create(array('http'=>
            array(
                'timeout' => 5,
            )
        ));

        $success = @$response = file_get_contents("http://127.0.0.1:42069/api/GetFilteredServers" . $filters . "&page=".$page, false, $ctx);

        if (!$success) {
            throw new ErrorException('Failure to connect to the API.', 0, 0, 0);
        }
    }
    catch (Exception $ex) {
        echo "
            <h1>Error fetching servers.</h1>
            <p>There was an error fetching servers from the SAMonitor API.</p>
            <p>This might be a server issue, in which case, an automated script has already alerted me about this. Please try again in a few minutes.</p>
            <p><a href='https://status.markski.ar/'>Current status of my services</a></p>
        ";
        exit;
    }

    $servers = json_decode($response, true);

    if (count($servers) == 0) {
        exit("<h1>No results</h1><p>Sorry, there are no results for your filter options.</p><p>If we're missing a server, feel free to add it on the add server page.</p>");
    }

    foreach ($servers as $server) {
        DrawServer($server);
    }

    if (Count($servers) == 20) {   
        echo '
            <div hx-target="this" style="margin: 3rem; width: 80%; text-align: center">
                <button hx-trigger="click" hx-get="./view/list_servers.php'.$filters.'&page='.($page + 1).'" hx-swap="outerHTML">Load more</button>
            </div>
        ';
    }
?>