<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { apiBase, buildApiUrl } from '$lib/api/urls';
    import { apiEndpoints, curlCommand, formatResponse, getEndpointParams, type ApiEndpoint } from '$lib/api/specs';
    import { DEFAULT_SITE_URL } from '$lib/metadata.js';

    let selected = $state(apiEndpoints[0]);
    let values = $state<Record<string, string>>({});
    let origin = $state(new URL(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).origin);
    let pending = $state(false);
    let result = $state<{ url: string; status: string; ok: boolean; elapsed: number; contentType: string; body: string; location: string | null; retryAfter: string | null } | null>(null);
    let error = $state('');
    let copyMessage = $state('');
    let controller: AbortController | null = null;

    const groups = [...new Set(apiEndpoints.map(endpoint => endpoint.group))];
    const parameters = $derived(getEndpointParams(selected, values));
    const isBody = $derived(selected.parameterLocation === 'body');
    const requestBody = $derived(isBody ? JSON.stringify(parameters, null, 2) : '');
    const requestUrl = $derived(buildApiUrl(selected.name, isBody ? undefined : parameters));
    const absoluteUrl = $derived(new URL(requestUrl, origin).href);
    const baseUrl = $derived(new URL(`${apiBase}/`, origin).href);
    const command = $derived(curlCommand(absoluteUrl, selected.method, isBody ? parameters : undefined));

    function resetParameters() {
        values = Object.fromEntries(selected.parameters.map(parameter => [parameter.name, '']));
        copyMessage = '';
    }

    function selectEndpoint(endpoint: ApiEndpoint) {
        controller?.abort();
        controller = null;
        pending = false;
        selected = endpoint;
        resetParameters();
        result = null;
        error = '';
        copyMessage = '';
    }

    onMount(() => {
        origin = window.location.origin;
        const endpoint = apiEndpoints.find(endpoint => `#${endpoint.name}` === window.location.hash);
        if (endpoint) selectEndpoint(endpoint);
        const followHash = () => {
            const endpoint = apiEndpoints.find(endpoint => `#${endpoint.name}` === window.location.hash);
            if (endpoint && endpoint.name !== selected.name) selectEndpoint(endpoint);
        };
        window.addEventListener('hashchange', followHash);
        return () => window.removeEventListener('hashchange', followHash);
    });

    onDestroy(() => controller?.abort());

    async function copy(text: string, label: string) {
        try {
            await navigator.clipboard.writeText(text);
            copyMessage = `${label} copied.`;
        } catch {
            copyMessage = 'Clipboard unavailable. Select and copy the text manually.';
        }
    }

    async function sendRequest(event: SubmitEvent) {
        event.preventDefault();
        if (pending) return;
        const activeController = new AbortController();
        controller = activeController;
        const url = absoluteUrl;
        pending = true;
        result = null;
        error = '';
        copyMessage = '';
        const start = performance.now();
        let timedOut = false;
        const timeout = setTimeout(() => {
            timedOut = true;
            activeController.abort();
        }, 30000);

        try {
            const response = await fetch(url, {
                method: selected.method ?? 'GET', signal: activeController.signal,
                headers: isBody ? { Accept: '*/*', 'Content-Type': 'application/json' } : { Accept: '*/*' },
                body: requestBody || undefined
            });
            const body = await response.text();
            if (controller !== activeController) return;
            result = {
                url, status: `${response.status} ${response.statusText}`.trim(), ok: response.ok,
                elapsed: Math.round(performance.now() - start),
                contentType: response.headers.get('content-type') ?? 'Not provided',
                body: formatResponse(body), location: response.headers.get('location'), retryAfter: response.headers.get('retry-after')
            };
        } catch {
            if (controller !== activeController) return;
            error = activeController.signal.aborted
                ? timedOut ? 'Request timed out after 30 seconds.' : 'Request canceled.'
                : 'Could not reach the API. Check the connection and API URL.';
        } finally {
            clearTimeout(timeout);
            if (controller === activeController) {
                controller = null;
                pending = false;
            }
        }
    }
</script>

<div class="page-shell api-page">
    <h2>API</h2>
    <p class="page-intro">Server listings, statistics, and history.</p>

    <section class="innerContent overview" aria-label="API overview">
        <div class="base"><span>Base URL</span><code>{baseUrl}</code></div>
        <p>No API key required. JSON responses unless noted.</p>
    </section>

    <div class="api-layout">
        <nav class="innerContent endpoint-list" aria-label="API endpoints">
            <h3>Endpoints</h3>
            {#each groups as group}
                <div class="endpoint-group">
                    <p class="group-label">{group}</p>
                    {#each apiEndpoints.filter(endpoint => endpoint.group === group) as endpoint}
                        <a id={endpoint.name} href={`#${endpoint.name}`} class:chosen={selected.name === endpoint.name}
                            aria-current={selected.name === endpoint.name ? 'true' : undefined}
                            onclick={() => selectEndpoint(endpoint)}>
                            <span class="method">{endpoint.method ?? 'GET'}</span><span>{endpoint.name}</span>
                        </a>
                    {/each}
                </div>
            {/each}
        </nav>

        <div class="endpoint-detail">
            <section class="innerContent specification" aria-labelledby="endpoint-title">
                <div class="endpoint-heading"><span class="method">{selected.method ?? 'GET'}</span><h3 id="endpoint-title">{selected.name}</h3></div>
                <p>{selected.description}</p>
                <p class="response-type"><b>Response:</b> {selected.response}</p>
                {#if selected.statuses}
                    <table class="status-codes">
                        <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
                        <tbody>{#each selected.statuses as status}<tr><td><code>{status.code}</code></td><td>{status.description}</td></tr>{/each}</tbody>
                    </table>
                {/if}
                {#each selected.notes as note}<p class="note">{note}</p>{/each}

                <h4>{isBody ? 'JSON body' : 'Query parameters'}</h4>
                {#if selected.parameters.length}
                    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontal scrolling.) -->
                    <div class="table-scroll" role="region" aria-label="Parameter specifications" tabindex="0">
                        <table>
                            <thead><tr><th>Parameter</th><th>Type / default</th><th>Description</th></tr></thead>
                            <tbody>
                                {#each selected.parameters as parameter}
                                    <tr>
                                        <td><code>{parameter.name}</code>{#if parameter.required}<span class="required">Required</span>{/if}</td>
                                        <td>{parameter.type}<br /><span class="muted">{parameter.default ?? 'No default'}</span></td>
                                        <td>{parameter.description}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}<p class="muted">None.</p>{/if}

                {#if selected.schema}
                    <details>
                        <summary>Response schema</summary>
                        <pre><code>{selected.schema}</code></pre>
                    </details>
                {/if}
            </section>

            <section class="innerContent playground" aria-labelledby="playground-title">
                <h3 id="playground-title">Playground</h3>
                <form onsubmit={sendRequest}>
                    {#if selected.parameters.length}
                        <div class="parameter-fields">
                            {#each selected.parameters as parameter (parameter.name)}
                                <label class="parameter-field">
                                    <span><code>{parameter.name}</code>{#if parameter.required}<span class="required">Required</span>{/if}</span>
                                    {#if parameter.options}
                                        <select bind:value={values[parameter.name]} disabled={pending}>
                                            <option value="">Default: {parameter.default}</option>
                                            {#each parameter.options as option}<option value={option}>{option}</option>{/each}
                                        </select>
                                    {:else}
                                        <input type="text" bind:value={values[parameter.name]} disabled={pending}
                                            required={parameter.required} pattern={parameter.type === 'integer' ? '-?[0-9]+' : parameter.required ? '.*\\S.*' : undefined}
                                            title={parameter.type === 'integer' ? 'Enter a whole number.' : undefined}
                                            placeholder={parameter.placeholder ?? `Default: ${parameter.default}`}
                                            aria-label={`${parameter.name}${parameter.required ? ' (required)' : ''}`} />
                                    {/if}
                                    {#if parameter.hint}<small class="muted">{parameter.hint}</small>{/if}
                                </label>
                            {/each}
                        </div>
                    {/if}
                    <div class="request-preview">
                        <h4>Request URL</h4>
                        <pre><code>{absoluteUrl}</code></pre>
                        {#if isBody}<h4>JSON body</h4><pre><code>{requestBody}</code></pre>{/if}
                        <h4>cURL</h4>
                        <pre><code>{command}</code></pre>
                    </div>
                    {#if selected.mutates}
                        <p class="mutation-note">Adds a real server to the monitor.</p>
                    {/if}
                    <div class="actions">
                        <button class="primary-button" type="submit" disabled={pending}>{pending ? 'Sending…' : selected.mutates ? 'Add server' : 'Send request'}</button>
                        {#if pending}<button type="button" onclick={() => controller?.abort()}>Cancel</button>{/if}
                        <button type="button" onclick={() => copy(absoluteUrl, 'URL')}>Copy URL</button>
                        <button type="button" onclick={() => copy(command, 'cURL')}>Copy cURL</button>
                        {#if selected.parameters.length}
                            <button type="button" disabled={pending} onclick={resetParameters}>Reset parameters</button>
                        {/if}
                    </div>
                </form>
                <p class="feedback" role="status">{copyMessage}</p>
                <div class="response" aria-live="polite" aria-busy={pending}>
                    <h4>Response</h4>
                    {#if pending}
                        <p class="muted">Waiting for the API…</p>
                    {:else if error}
                        <p class="error" role="alert">{error}</p>
                    {:else if result}
                        <div class="response-meta"><b class:error={!result.ok}>{result.status}</b><span>{result.elapsed} ms</span><span>{result.contentType}</span></div>
                        <p class="response-url muted">{result.url}</p>
                        {#if result.location}<p class="response-url muted">Location: {result.location}</p>{/if}
                        {#if result.retryAfter}<p class="muted">Retry-After: {result.retryAfter}</p>{/if}
                        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to scrolling the response.) -->
                        <pre class="response-body" tabindex="0" aria-label="Response body"><code>{result.body}</code></pre>
                        <button type="button" onclick={() => copy(result?.body ?? '', 'Response')}>Copy response</button>
                    {:else}<p class="muted">Send a request to see the live response here.</p>{/if}
                </div>
            </section>
        </div>
    </div>
</div>

<style>
    .api-page { min-width: 0; }
    .muted, .note { color: var(--text-muted); }
    .overview { margin-bottom: 1rem; }
    .base { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 1rem; }
    .base span { color: var(--text-muted); }
    .base code { overflow-wrap: anywhere; }
    .api-layout { display: grid; grid-template-columns: 15.5rem minmax(0, 1fr); gap: 1rem; align-items: start; }
    .endpoint-list, .specification { margin-top: 0; }
    .endpoint-list { padding: 1.2rem 0.8rem; }
    .endpoint-list h3 { padding: 0 0.4rem; }
    .endpoint-group + .endpoint-group { margin-top: 1rem; }
    .group-label { margin: 0 0 0.3rem; padding: 0 0.4rem; color: var(--text-muted); font-size: 0.82rem; }
    .endpoint-list a { display: flex; align-items: center; gap: 0.55rem; padding: 0.5rem 0.4rem; border-radius: 10px; font-size: 0.85rem; color: var(--text-muted); text-decoration: none; }
    .endpoint-list a:hover { background: var(--surface-soft); color: var(--text); }
    .endpoint-list a.chosen { background: var(--accent-soft); color: var(--text); }
    .endpoint-list a span:last-child { min-width: 0; overflow-wrap: anywhere; }
    .method { font-size: 0.72rem; font-weight: 650; color: var(--accent); }
    .endpoint-detail { min-width: 0; }
    .endpoint-heading { display: flex; gap: 0.7rem; align-items: baseline; }
    .endpoint-heading h3 { margin-bottom: 0; overflow-wrap: anywhere; }
    .response-type { font-size: 0.9rem; }
    .note { font-size: 0.9rem; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 0.88em; }
    .table-scroll { overflow-x: auto; }
    .table-scroll:focus-visible, .response-body:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    table { min-width: 32rem; }
    .status-codes { min-width: 0; }
    td { vertical-align: top; padding: 0.65rem 0.45rem; }
    th { padding-left: 0.45rem; }
    td:last-child { color: var(--text-muted); }
    .required { display: block; color: var(--accent); font-size: 0.75rem; font-weight: 400; }
    details { margin-top: 1rem; }
    summary { cursor: pointer; color: var(--accent); }
    pre { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 0.8rem; margin: 0.5rem 0 0.8rem; overflow: auto; line-height: 1.6; }
    .request-preview pre { white-space: pre-wrap; overflow-wrap: anywhere; }
    .parameter-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 1rem; }
    .parameter-field { display: grid; gap: 0.3rem; align-content: start; }
    .parameter-field > span { display: flex; align-items: baseline; gap: 0.5rem; }
    .parameter-field input, .parameter-field select { width: 100%; min-width: 0; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .actions button { margin: 0; font-size: 0.9rem; }
    .mutation-note { padding: 0.8rem; background: var(--surface-accent); border-radius: 10px; }
    .feedback { font-size: 0.85rem; color: var(--accent); }
    .feedback:empty { display: none; }
    .response { margin-top: 1.2rem; border-top: 1px solid var(--border); }
    .response-meta { display: flex; flex-wrap: wrap; gap: 0.45rem 1rem; font-size: 0.85rem; }
    .response-meta span { color: var(--text-muted); }
    .response-url { font-size: 0.8rem; overflow-wrap: anywhere; }
    .response-body { max-height: 32rem; }
    .error { color: var(--error); }
    @media (max-width: 1100px) {
        .api-layout { grid-template-columns: minmax(0, 1fr); }
        .endpoint-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: 0.75rem; }
        .endpoint-list h3 { grid-column: 1 / -1; margin-bottom: 0; }
        .endpoint-group + .endpoint-group { margin-top: 0; }
    }
    @media (max-width: 480px) {
        .endpoint-list { grid-template-columns: minmax(0, 1fr); }
        .parameter-fields { grid-template-columns: minmax(0, 1fr); }
    }
</style>
