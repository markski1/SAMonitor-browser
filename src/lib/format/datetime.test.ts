import { describe, expect, it } from 'vitest';
import { formatLastUpdated, formatMetricTime, parseDatetime } from './datetime';

describe('parseDatetime', () => {
    it('parses a timestamp with fractional seconds', () => {
        const result = parseDatetime('2024-03-15T10:20:30.123456Z');
        // JavaScript's Date only supports millisecond precision
        expect(result.toISOString()).toBe('2024-03-15T10:20:30.123Z');
    });

    it('truncates extra precision beyond microseconds', () => {
        // The API sometimes emits 7+ fractional digits, idk why
        const result = parseDatetime('2024-03-15T10:20:30.1234567Z');
        expect(result.toISOString()).toBe('2024-03-15T10:20:30.123Z');
    });

    it('parses a timestamp without fractional seconds', () => {
        const result = parseDatetime('2024-03-15T10:20:30Z');
        expect(result.toISOString()).toBe('2024-03-15T10:20:30.000Z');
    });

    it('falls back to now on malformed input', () => {
        const before = Date.now();
        const result = parseDatetime('not a date');
        const after = Date.now();
        expect(result.getTime()).toBeGreaterThanOrEqual(before);
        expect(result.getTime()).toBeLessThanOrEqual(after);
    });
});

describe('formatLastUpdated', () => {
    const now = new Date('2024-03-15T12:00:00Z');

    it('formats 1 minute ago', () => {
        const t = new Date(now.getTime() - 60 * 1000);
        expect(formatLastUpdated(t, now)).toBe('1 minute ago');
    });

    it('formats many minutes ago', () => {
        const t = new Date(now.getTime() - 5 * 60 * 1000);
        expect(formatLastUpdated(t, now)).toBe('5 minutes ago');
    });

    it('formats 1 hour ago', () => {
        const t = new Date(now.getTime() - 60 * 60 * 1000);
        expect(formatLastUpdated(t, now)).toBe('1 hour ago');
    });

    it('formats many hours ago', () => {
        const t = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        expect(formatLastUpdated(t, now)).toBe('3 hours ago');
    });
});

describe('formatMetricTime', () => {
    const t = new Date('2024-03-15T10:20:30Z');

    it('formats short range as HH:MM', () => {
        expect(formatMetricTime(t, 'short')).toBe('10:20');
    });

    it('formats medium range as dd/mm HH:MM', () => {
        expect(formatMetricTime(t, 'medium')).toBe('15/03 10:20');
    });

    it('formats long range as dd/mm/yyyy', () => {
        expect(formatMetricTime(t, 'long')).toBe('15/03/2024');
    });
});
