import { expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import { isServer, type Server } from '$lib/types/server';
import ServerCard from './ServerCard.svelte';

vi.mock('$lib/api', () => ({ getServerByIp: vi.fn(), getServerMetrics: vi.fn() }));

it('accepts and displays the API boolean fields', () => {
    const server: Server = {
        id: 1, ipAddr: '1.2.3.4:7777', name: 'Test server', playersOnline: 10, maxPlayers: 100,
        gameMode: 'Freeroam', language: 'English', mapName: 'San Andreas', version: 'omp 1.4',
        sampCac: 'Not required', website: 'https://example.com', lagComp: true, isOpenMp: true,
        lastUpdated: '2024-03-15T10:20:30Z'
    };
    expect(isServer(server)).toBe(true);
    const { body } = render(ServerCard, { props: { server, expanded: true } });
    expect(body).toContain('open.mp');
    expect(body).toContain('Enabled');
});
