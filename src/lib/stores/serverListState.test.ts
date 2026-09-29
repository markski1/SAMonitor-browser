import { beforeEach, expect, it, vi } from 'vitest';
import { getFilteredServers } from '$lib/api';
import type { Server } from '$lib/types/server';
import { DEFAULT_FILTERS } from './filters';
import { filtersKey, loadPage, resetServerListState, serverListState } from './serverListState.svelte';

vi.mock('$lib/api', () => ({ getFilteredServers: vi.fn(), ApiError: Error, NetworkError: Error }));

const fetchServers = vi.mocked(getFilteredServers);
const server = { id: 1 } as Server;

beforeEach(() => {
    resetServerListState();
    fetchServers.mockReset();
});

it('accepts only the latest filters even when an aborted request finishes later', async () => {
    let finishOld!: (servers: Server[]) => void;
    fetchServers.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
    const old = loadPage(0, true, DEFAULT_FILTERS);
    expect(serverListState.lastLoadedKey).toBe('');
    const changed = { ...DEFAULT_FILTERS, name: 'new filter' };
    fetchServers.mockResolvedValueOnce([{ ...server, id: 2 }]);
    await loadPage(0, true, changed);
    finishOld([server]);
    await old;

    expect(fetchServers.mock.calls[0][1]?.aborted).toBe(true);
    expect(serverListState.lastLoadedKey).toBe(filtersKey(changed));
    expect(serverListState.servers.map(server => server.id)).toEqual([2]);
    expect(serverListState.loading).toBe(false);
});

it('invalidates the loaded filter key while its snapshot is being replaced', async () => {
    fetchServers.mockResolvedValueOnce([server]);
    await loadPage(0, true, DEFAULT_FILTERS);
    let finish!: (servers: Server[]) => void;
    fetchServers.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const pending = loadPage(0, true, { ...DEFAULT_FILTERS, name: 'new filter' });

    expect(serverListState.lastLoadedKey).toBe('');
    fetchServers.mockResolvedValueOnce([{ ...server, id: 3 }]);
    await loadPage(0, true, DEFAULT_FILTERS);
    finish([{ ...server, id: 2 }]);
    await pending;
    expect(serverListState.servers.map(server => server.id)).toEqual([3]);
});

it('pages a fixed snapshot without duplicate or skipped cards', async () => {
    const snapshot = Array.from({ length: 80 }, (_, id) => ({ ...server, id }));
    fetchServers.mockResolvedValueOnce([...snapshot, snapshot[0]]);
    await loadPage(0, true, DEFAULT_FILTERS);
    expect(serverListState.servers).toHaveLength(40);
    await loadPage(1, false, DEFAULT_FILTERS);

    expect(fetchServers).toHaveBeenCalledTimes(1);
    expect(serverListState.servers.map(server => server.id)).toEqual(snapshot.map(server => server.id));
    expect(serverListState.hasMore).toBe(false);
});
