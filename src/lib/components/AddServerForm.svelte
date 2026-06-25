<script lang="ts">
    import { ApiError, NetworkError, addServer } from '$lib/api';

    let ip = $state('');
    let status = $state<'idle' | 'pending' | 'success' | 'error'>('idle');
    let message = $state<string>('Result: Waiting for submit...');

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        if (!ip.trim()) return;

        status = 'pending';
        message = 'Result: Submitting...';
        try {
            const result = await addServer(ip.trim());
            status = 'success';
            message = `Result: ${result}`;
        } catch (e) {
            status = 'error';
            message =
                e instanceof NetworkError
                    ? 'Result: Error contacting SAMonitor. Please try again later.'
                    : e instanceof ApiError
                      ? `Result: ${e.message}`
                      : 'Result: Unexpected error.';
        }
    }
</script>

<div class="innerContent">
    <h3>Add server directly</h3>
    <p>If you're blocking the range containing gateway.markski.ar (45.153.48.229), this won't work.</p>
    <hr />
    <form class:is-loading={status === 'pending'} onsubmit={submit}>
        <label>
            IP Address or domain:<br />
            <input
                required
                type="text"
                bind:value={ip}
                style="width: 20rem"
                placeholder="address:port format please."
            />
        </label>
        <input type="submit" value="Add server" disabled={status === 'pending'} />
        <img
            style="width: 2rem; vertical-align: middle"
            src="/loading.svg"
            class="loading-indicator"
            alt="Loading indicator."
        />
        <div id="result" style="margin-top: .5rem">{message}</div>
    </form>
    <hr />
    <p>If you change your IP in the future just submit it again, old ones are removed automatically.</p>
    <p>We will fetch all information automatically.</p>
</div>
