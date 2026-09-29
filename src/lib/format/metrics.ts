import type { ServerMetricInstant, ServerMetrics } from '../types/metrics';
import { parseDatetime } from './datetime';

export function computeMetrics(logged: ServerMetricInstant[]): ServerMetrics {
    const ordered = logged.map(instant => ({ ...instant, timestamp: parseDatetime(instant.time).getTime() }))
        .sort((a, b) => a.timestamp - b.timestamp);
    let missed = 0;
    let totalPlayers = 0;
    let observedTime = 0;
    let onlineTime = 0;

    for (let i = 0; i < ordered.length; i++) {
        const instant = ordered[i];
        if (instant.players < 0) missed++;
        else totalPlayers += instant.players;

        if (i + 1 < ordered.length) {
            const duration = ordered[i + 1].timestamp - instant.timestamp;
            observedTime += duration;
            if (instant.players >= 0) onlineTime += duration;
        }
    }

    const totalReqs = logged.length;
    const successful = totalReqs - missed;
    return {
        loggedData: logged,
        totalReqs,
        missedReqs: missed,
        totalPlayers,
        uptimePct: observedTime > 0 ? onlineTime / observedTime * 100 : null,
        avgPlayers: successful > 0 ? totalPlayers / successful : 0
    };
}
