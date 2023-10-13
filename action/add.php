<?php
    if (str_contains($_POST['ip_addr'], ' ')) {
        echo '<p>An IP address cannot contain a space.</p>';
        exit;
    }

    $result = file_get_contents("http://127.0.0.1:42069/api/AddServer?ip_addr=".trim($_POST['ip_addr']));

    echo "Result: {$result}";
?>