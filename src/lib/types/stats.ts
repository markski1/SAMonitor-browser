export interface GlobalStats {
    serversOnline: number;
    serversTracked: number;
    serversInhabited: number;
    serversOnlineOMP: number;
    playersOnline: number;
}

export interface LanguageBucket {
    amount: number;
    players: number;
}

export interface LanguageStats {
    russian: LanguageBucket;
    english: LanguageBucket;
    spanish: LanguageBucket;
    portuguese: LanguageBucket;
    romanian: LanguageBucket;
    eastEuro: LanguageBucket;
    westEuro: LanguageBucket;
    asia: LanguageBucket;
    other: LanguageBucket;
}

export interface GamemodeStats {
    roleplay: LanguageBucket;
    deathmatch: LanguageBucket;
    raceStunt: LanguageBucket;
    cnr: LanguageBucket;
    freeRoam: LanguageBucket;
    survival: LanguageBucket;
    vehSim: LanguageBucket;
    other: LanguageBucket;
}

export interface GlobalMetric {
    time: string;
    players: number;
    servers: number;
    ompServers: number;
}

export function isGlobalStats(value: unknown): value is GlobalStats {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.serversOnline === 'number' &&
        typeof v.serversTracked === 'number' &&
        typeof v.serversInhabited === 'number' &&
        typeof v.serversOnlineOMP === 'number' &&
        typeof v.playersOnline === 'number'
    );
}
