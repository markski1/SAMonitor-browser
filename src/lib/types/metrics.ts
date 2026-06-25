/**
 * Per-server metric instant. `players` of -1 means the server did not respond
 * to the query at that moment (downtime marker).
 */
export interface ServerMetricInstant {
    time: string;
    players: number;
}

export interface ServerMetrics {
    loggedData: ServerMetricInstant[];
    totalReqs: number;
    missedReqs: number;
    totalPlayers: number;
    uptimePct: number;
    avgPlayers: number;
}
