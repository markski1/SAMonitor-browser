<?php
    include 'logic/layout.php';

    PageHeader("metrics");
?>

<div>
    <h2>Metrics</h2>
    <p>SAMonitor accounts for the total amount of servers and players a few times every hour, of every day.</p>
    <div>
        <div class="innerContent" hx-get="../view/metrics_body.php" hx-trigger="load" hx-swap="outerHTML">
            <h3>Loading metrics</h3>
            <p>Please wait.</p>
        </div>
    </div>
</div>

<script>
    document.title = "SAMonitor - metrics";
    window.scrollTo(0, 0);
</script>

<?php PageBottom() ?>