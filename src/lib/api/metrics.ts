import type { ServerMetricInstant } from '$lib/types/metrics';
import { request } from './client';

export function getServerMetrics(
    ipAddr: string,
    hours: number,
    includeMisses = true,
    signal?: AbortSignal
) {
    return request<ServerMetricInstant[]>('/GetServerMetrics', {
        params: {
            ip_addr: ipAddr,
            hours,
            include_misses: includeMisses ? 1 : 0
        },
        signal
    });
}
