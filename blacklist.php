<?php
    include 'logic/layout.php';
    PageHeader("blacklist", "Information regarding servers blacklisted from SAMonitor.");
?>

<div>
    <h2>Blacklist</h2>
    <p>Harmful activity will result in servers being blacklisted.</p>

    <div class="innerContent">
        <h3>Defining harm</h3>
        <p>While I reserve the right to decide what does and doesn't constitute harmful activity, here's a few likely examples.</p>
        <ul>
            <li>Faking your player count or other data.</li>
            <li>The server is an illegitimate clone of another server.</li>
            <li>The server's staff have taken a hostile stance towards the San Andreas community.</li>
            <li>The server's staff have taken a hostile stance towards this service or my person.</li>
        </ul>
        <small>* An example of a hostile stance could be a threat or an attempt at causing harm or disruption.</small>
    </div>

    <p>There are no permanent blocks in SAMonitor. No matter the size of the transgression, if you have truly rectified it, you may appeal and be unblocked.</p>
    <p>If you own a blocked server and wish to appeal, contact me.</p>
    <p>Email: me@markski.ar<br/>Discord: markski.ar (yes, that's a username)<br/>Telegram: @Markski</p>

    <div class="innerContent">
        <h3>Blocked servers</h3>
        <p>While not a live number, there's currently around ~20 servers blacklisted for differing reasons (mostly faking player counts).</p>
        <p>Here used to show a public list of every blocked server, but because it used to cause confusion and general drama I've decided to retire the public list. You can still figure out if your server is blacklisted simply by trying to add it.</p>
    </div>
    <div class="innerContent">
        <h3>IP Blocking regardless of server</h3>
        <p>
            If your server is found to register several IP's pointing to the same server, the server itself won't be blocked, but any IP found to be repeated will be blocked.
        </p>
        <p>
            Attempts to bypass the anti-repeat measures, successful or not, will result in blacklisting.
        </p>
    </div>
</div>

<script>
    document.title = "SAMonitor - blacklist";}
    window.scrollTo(0, 0);
</script>

<?php PageBottom() ?>