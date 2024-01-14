<?php
    include 'logic/layout.php';

    PageHeader("statistics");
?>

<div>
    <h2>Statistics</h2>
    <p>SAMonitor accounts for the total amount of servers and players a few times every hour, of every day.</p>
    <div>
        <div class="innerContent" hx-get="../view/metrics_body.php" hx-trigger="load" hx-swap="outerHTML">
            <h3>Loading statistics</h3>
            <p>Please wait.</p>
        </div>
    </div>
</div>

<script>
    document.title = "SAMonitor - statistics";
    window.scrollTo(0, 0);
</script>

<?php PageBottom() ?>