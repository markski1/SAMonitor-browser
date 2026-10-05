import { expect, it } from 'vitest';
import { apiEndpoints, curlCommand, formatResponse, getEndpointParams } from './specs';
import { apiBase, buildApiUrl } from './urls';

it('omits blank optional values while preserving zero and false', () => {
    const endpoint = apiEndpoints.find(endpoint => endpoint.name === 'GetGlobalMetrics')!;
    const params = getEndpointParams(endpoint, { hours: ' 0 ', skip_trimming: 'false', ip_addr: 'ignored' });
    expect(params).toEqual({ hours: '0', skip_trimming: 'false' });
    expect(getEndpointParams(endpoint, { hours: ' ', skip_trimming: '' })).toEqual({});
});

it('encodes addresses and filter text without creating extra query parameters', () => {
    const url = buildApiUrl('GetFilteredServers', { name: 'A&B #1 + café', show_empty: 0, language: null });
    const parsed = new URL(url, 'https://example.com');
    expect(parsed.searchParams.get('name')).toBe('A&B #1 + café');
    expect(parsed.searchParams.get('show_empty')).toBe('0');
    expect([...parsed.searchParams.keys()]).toEqual(['name', 'show_empty']);
    expect(buildApiUrl('/GetServerByIP', { ip_addr: '203.0.113.10:7777' })).toBe(`${apiBase}/GetServerByIP?ip_addr=203.0.113.10%3A7777`);
    expect(buildApiUrl('CheckAlive')).toBe(`${apiBase}/CheckAlive`);
});

it('displays JSON, text, invalid JSON, and empty HTTP responses', () => {
    expect(formatResponse('{"players":0}')).toBe('{\n  "players": 0\n}');
    expect(formatResponse('SAMonitor lives!')).toBe('SAMonitor lives!');
    expect(formatResponse('<html>Service unavailable</html>')).toBe('<html>Service unavailable</html>');
    expect(formatResponse('')).toBe('(empty body)');
});

it('quotes request URLs for a shell without executing their contents', () => {
    expect(curlCommand('https://example.com/api/Test?name=a&b=1')).toBe("curl 'https://example.com/api/Test?name=a&b=1'");
    expect(curlCommand("https://example.com/api/Test?name=O'Brien")).toBe("curl 'https://example.com/api/Test?name=O'\\''Brien'");
});
