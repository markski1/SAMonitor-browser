<?php
    include 'logic/layout.php';
    PageHeader("about");
?>

<div>
    <h2>About</h2>
    <p>SAMonitor is a SA-MP and open.mp server monitor. It tracks activity of them and is a good replacement of standard listings.</p>
    <div class="innerContent">
        <h3>Project</h3>
        <p>SAMonitor intends to be a "spiritual successor" of SACNR Monitor. It is a completely free and open source project. All code and API documentation is in <a target="_blank" href="https://github.com/markski1/SAMonitor">GitHub</a>.</p>

        <p>SAMonitor's mission is as follows:</p>
        <ul>
            <li>Monitor every SA-MP and open.mp server.</li>
            <li>Maintain a free and open web interface (you are here) for people to access the data.</li>
            <li>Maintain a free and open API for developers to use the data.</li>
            <li>Offer the highest quality listings: Don't have repeated servers, don't fill the masterlist with trash.</li>
            <li>Blacklist illegitimate servers, be them stolen scripts, malicious or faking data.</li>
        </ul>
        <p>Contact</p>
        <p>Email: me@markski.ar<br/>Discord: markski.ar (yes, that's a username)<br/>Telegram: @Markski</p>
        <p>For supporting SAMonitor, check the <a href="donate.php" hx-get="donate.php" hx-push-url="true" hx-target="#main">donations</a> page.</p>
    </div>

    <div class="innerContent">
        <h3>Functionality</h3>
        <p>SAMonitor's listings only include servers which are online.</p>
        <p>A server is considered offline if they replied to queries in the last 6 hours, and if they're not password protected. Servers who don't meet this are not listed, but continue to be tracked, and become listed when they do.</p>
        <p>Every server is queried every 20 minutes (3 times per hour). Each query updates its information and saves the player counts for posterity.</p>
        <p>SAMonitor keeps a constant, real-time count of servers and players online across the globe. These are stored every 30 minutes and visible in the <a href="metrics.php" hx-get="metrics.php" hx-push-url="true" hx-target="#main">metrics</a> page.</p>
    </div>
    <div class="innerContent">
        <h3>Third party attributions</h3>
        <p>HTMX by Carson Gross is used for the website's presentation. <a target="_blank" href="https://htmx.org">htmx.org</a></p>
        <p>SAMPQuery by JustMavi is used for querying on the API. <a target="_blank" href="https://github.com/justmavi/sampquery/">github.com/justmavi/sampquery</a></p>
        <p>Chart.Js, by multiple people, is used for drawing the website's graphs. <a target="_blank" href="https://www.chartjs.org/">chartjs.org</a></p>
    </div>
</div>

<script>
    document.title = "SAMonitor - about";
    window.scrollTo(0, 0);
</script>

<?php PageBottom() ?>