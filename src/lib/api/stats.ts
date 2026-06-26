import type {
    GamemodeStats,
    GlobalMetric,
    GlobalStats,
    LanguageStats
} from '$lib/types/stats';
import { request } from './client';

export function getGlobalStats(signal?: AbortSignal) {
    return request<GlobalStats>('/GetGlobalStats', { signal });
}

export function getLanguageStats(signal?: AbortSignal) {
    return request<LanguageStats>('/GetLanguageStats', { signal });
}

export function getGamemodeStats(signal?: AbortSignal) {
    return request<GamemodeStats>('/GetGamemodeStats', { signal });
}

export function getGlobalMetrics(hours: number, signal?: AbortSignal) {
    return request<GlobalMetric[]>('/GetGlobalMetrics', { params: { hours }, signal });
}
