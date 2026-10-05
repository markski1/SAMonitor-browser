import { afterEach, expect, it, vi } from 'vitest';
import { ApiError, request } from './client';
import { addServer } from './addServer';
import { buildApiUrl } from './urls';

afterEach(() => vi.unstubAllGlobals());

it.each([
    ['Service unavailable', 'Service unavailable'],
    ['{"title":"Invalid address","status":400}', { title: 'Invalid address', status: 400 }],
    ['{"broken":', '{"broken":'],
    ['', '']
])('preserves the error response body: %s', async (body, expected) => {
    const response = new Response(body, { status: 400 });
    const fetch = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);

    const error = await request('/AddServer').catch(error => error);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, body: expected });
});

it('submits JSON with POST and the caller’s abort signal', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ipAddr: '203.0.113.10:7777', message: 'Server added to SAMonitor.' }), { status: 201 }));
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();

    expect(await addServer('203.0.113.10:7777', controller.signal)).toBe('Server added to SAMonitor.');
    expect(fetch).toHaveBeenCalledWith(buildApiUrl('/AddServer'), {
        method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: '{"ipAddr":"203.0.113.10:7777"}'
    });
});

it('shows the API’s Problem Details message for a rejected submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 409, title: 'Server submission failed.', detail: 'Server is already monitored.' }), { status: 409 })));
    await expect(addServer('203.0.113.10:7777')).rejects.toMatchObject({ status: 409, message: 'Server is already monitored.' });
});

it('shows the problem title when no detail is provided', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 429, title: 'Too many requests.' }), { status: 429 })));
    await expect(addServer('203.0.113.10:7777')).rejects.toMatchObject({ status: 429, message: 'Too many requests.' });
});

it('keeps read requests on GET', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"playersOnline":0}'));
    vi.stubGlobal('fetch', fetch);

    expect(await request('/GetGlobalStats')).toEqual({ playersOnline: 0 });
    expect(fetch).toHaveBeenCalledWith(buildApiUrl('/GetGlobalStats'), { method: 'GET', signal: undefined });
});
