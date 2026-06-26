export interface Server {
    id: number;
    // Address string in "ip:port" form.
    ipAddr?: string;
    name: string;
    playersOnline: number;
    maxPlayers: number;
    gameMode: string;
    language: string;
    mapName: string;
    version: string;
    sampCac: string;
    website: string;
    lagComp: number;
    isOpenMp: number;
    lastUpdated: string;
}

export interface Player {
    id: number;
    name: string;
    score: number;
    ping: number;
}

export function isServer(value: unknown): value is Server {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.id === 'number' &&
        typeof v.name === 'string' &&
        typeof v.playersOnline === 'number' &&
        typeof v.maxPlayers === 'number' &&
        typeof v.gameMode === 'string' &&
        typeof v.language === 'string' &&
        typeof v.mapName === 'string' &&
        typeof v.version === 'string' &&
        typeof v.sampCac === 'string' &&
        typeof v.website === 'string' &&
        typeof v.lagComp === 'number' &&
        typeof v.isOpenMp === 'number' &&
        typeof v.lastUpdated === 'string'
    );
}

export function isPlayer(value: unknown): value is Player {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.id === 'number' &&
        typeof v.name === 'string' &&
        typeof v.score === 'number' &&
        typeof v.ping === 'number'
    );
}
