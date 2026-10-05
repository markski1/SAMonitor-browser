<script lang="ts">
    import { ApiError, NetworkError, addServer } from '$lib/api';

    let ip = $state('');
    let status = $state<'idle' | 'pending' | 'success' | 'error'>('idle');
    let message = $state('');

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        if (!ip.trim()) return;

        status = 'pending';
        message = '';
        try {
            const result = await addServer(ip.trim());
            status = 'success';
            message = result;
        } catch (e) {
            status = 'error';
            message =
                e instanceof NetworkError
                    ? 'Could not reach SAMonitor. Please try again later.'
                    : e instanceof ApiError
                      ? e.message
                      : 'Unexpected error.';
        }
    }
</script>

<div class="innerContent">
    <h3>Server address</h3>
    <p>Server details are fetched automatically.</p>
    <form onsubmit={submit} aria-busy={status === 'pending'}>
        <div class="submit-row">
            <label class="form-field">
                <span>IP address or hostname</span>
                <input required type="text" bind:value={ip} disabled={status === 'pending'}
                    placeholder="server.example.com:7777" aria-describedby="address-hint"
                    autocomplete="off" autocapitalize="none" spellcheck="false" />
            </label>
            <button class="primary-button" type="submit" disabled={status === 'pending'}>
                {#if status === 'pending'}<img src="/loading.svg" alt="" />{/if}
                {status === 'pending' ? 'Adding…' : 'Add server'}
            </button>
        </div>
        <small id="address-hint">Default port: 7777.</small>
        <div id="result" role="status" aria-live="polite" class:success={status === 'success'} class:error={status === 'error'}>{message}</div>
    </form>
    <div class="submission-notes">
        <p>If your address changes, submit it again. Old addresses are removed automatically.</p>
        <p>Allow queries from gateway.markski.ar (45.153.48.229) through your firewall.</p>
    </div>
</div>

<style>
    form { margin-top: 1.25rem; }
    .submit-row { display: flex; align-items: end; flex-wrap: wrap; gap: 0.75rem; }
    .form-field { flex: 1 1 16rem; }
    button { flex-shrink: 0; }
    button img { width: 1rem; height: 1rem; }
    #address-hint { display: block; margin-top: 0.5rem; }
    #result:empty { display: none; }
    #result { margin-top: 1rem; padding: 0.85rem 1rem; border: 1px solid var(--border); border-radius: 10px; overflow-wrap: anywhere; }
    #result.success { color: var(--success); background: rgba(163, 217, 176, 0.06); }
    #result.error { color: var(--error); background: rgba(243, 170, 165, 0.06); }
    .submission-notes { margin-top: 1.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; }
    @media (max-width: 480px) { button { width: 100%; } }
</style>
