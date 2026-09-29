import type { Server } from "$lib/types/server";
import type { ServerMetrics } from "$lib/types/metrics";
import { computeMetrics } from "$lib/format/metrics";
import { getServerByIp, getServerMetrics } from "$lib/api";

export interface CachedServerPage {
  server: Server;
  metrics: ServerMetrics;
}

const CACHE_TTL_MS = 60 * 1000;

const pending = new Map<string, Promise<CachedServerPage>>();

export function prefetchServerPage(ip: string): void {
  if (pending.has(ip)) return;
  const promise = Promise.all([
    getServerByIp(ip),
    getServerMetrics(ip, 168, true),
  ]).then(([server, logged]) => ({ server, metrics: computeMetrics(logged) }));
  // Swallow rejection here so it doesn't surface as an unhandled rejection.
  // The cache entry is dropped so the next prefetch/visit can retry.
  promise.catch(() => {
    pending.delete(ip);
  });
  pending.set(ip, promise);
  setTimeout(() => pending.delete(ip), CACHE_TTL_MS);
}

export function takeServerPagePrefetch(
  ip: string,
): Promise<CachedServerPage> | null {
  return pending.get(ip) ?? null;
}
