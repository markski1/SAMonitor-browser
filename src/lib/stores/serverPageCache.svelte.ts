import type { Server } from "$lib/types/server";
import type { ServerMetrics, ServerMetricInstant } from "$lib/types/metrics";
import { getServerByIp, getServerMetrics } from "$lib/api";

export interface CachedServerPage {
  server: Server;
  metrics: ServerMetrics;
}

function computeMetrics(logged: ServerMetricInstant[]): ServerMetrics {
  const totalReqs = logged.length;
  let missed = 0;
  let totalPlayers = 0;
  for (const instant of logged) {
    if (instant.players < 0) missed += 1;
    else totalPlayers += instant.players;
  }
  const uptimePct =
    totalReqs > 0 && missed > 0 ? 100 - (missed / totalReqs) * 100 : 100;
  const success = totalReqs - missed;
  const avgPlayers = success > 0 ? totalPlayers / success : 0;
  return {
    loggedData: logged,
    totalReqs,
    missedReqs: missed,
    totalPlayers,
    uptimePct,
    avgPlayers,
  };
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
