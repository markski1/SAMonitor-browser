export function parseDatetime(input: string): Date {
    // Match ISO 8601 shape: YYYY-MM-DDTHH:MM:SS[.fff[fff[fff]]]Z
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?Z?$/.exec(input);
    if (!match) {
        const fallback = new Date(input);
        return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
    }

    const [, y, mo, d, h, mi, s, frac = ''] = match;
    // JS only handles millisecond precision
    const ms = Number.parseInt(frac.slice(0, 3).padEnd(3, '0') || '0', 10);

    return new Date(Date.UTC(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        Number(s),
        ms
    ));
}

export function formatLastUpdated(lastUpdated: Date, now: Date = new Date()): string {
    const deltaSec = Math.max(0, Math.floor((now.getTime() - lastUpdated.getTime()) / 1000));
    const hours = Math.floor(deltaSec / 3600);
    const minutes = Math.floor((deltaSec % 3600) / 60);

    if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
}

export type MetricTimeRange = 'short' | 'medium' | 'long';

export function formatMetricTime(date: Date, range: MetricTimeRange): string {
    switch (range) {
        case 'long':
            return formatDate(date, '%d/%m/%Y');
        case 'medium':
            return formatDate(date, '%d/%m %H:%M');
        case 'short':
        default:
            return formatDate(date, '%H:%M');
    }
}

function formatDate(date: Date, pattern: string): string {
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getUTCFullYear());
    const HH = String(date.getUTCHours()).padStart(2, '0');
    const MM = String(date.getUTCMinutes()).padStart(2, '0');

    return pattern
        .replace('%Y', yyyy)
        .replace('%y', yyyy.slice(-2))
        .replace('%m', mm)
        .replace('%d', dd)
        .replace('%H', HH)
        .replace('%M', MM);
}
