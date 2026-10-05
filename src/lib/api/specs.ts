export interface ApiParameter {
    name: string;
    type: 'string' | 'integer' | 'boolean';
    description: string;
    default?: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

export interface ApiEndpoint {
    name: string;
    group: string;
    description: string;
    parameters: ApiParameter[];
    response: string;
    schema?: string;
    notes: string[];
    mutates?: boolean;
}

const address: ApiParameter = {
    name: 'ip_addr', type: 'string', required: true, placeholder: '203.0.113.10:7777',
    description: 'Monitored IPv4 address, preferably with a port. Without a port, lookup prefers 7777, then the first tracked server on that IP. Hostnames are not resolved by lookup.'
};

const hours: ApiParameter = {
    name: 'hours', type: 'integer', default: '6',
    description: 'Look back this many hours. The backend does not impose a positive range.'
};

function flag(name: string, description: string): ApiParameter {
    return { name, type: 'integer', default: '0', options: ['0', '1'], description: `${description} Zero disables; any nonzero integer enables.` };
}

const serverSchema = `{
  id: integer,
  success: boolean,
  lastUpdated: ISO 8601 date-time string,
  worldTime: ISO 8601 date-time string,
  playersOnline: integer,
  maxPlayers: integer,
  isOpenMp: boolean,
  isProxyQueried: boolean,
  lagComp: boolean,
  name: string,
  gameMode: string,
  ipAddr: string,
  mapName: string,
  website: string,
  version: string,
  language: string,
  sampCac: string,
  requiresPassword: boolean,
  shuffledOrder: integer,
  weather: integer,
  sponsor: boolean
}`;

const categoryNotes = ['Each category contains amount (server count) and players (player count). Categories are assigned by backend text heuristics, not exact language or gamemode codes.'];

export const apiEndpoints: ApiEndpoint[] = [
    {
        name: 'GetAllServers', group: 'Servers', description: 'Get the recently online server list without filters.',
        parameters: [], response: '200 · Server[]', schema: `Array of Server objects:\n${serverSchema}`,
        notes: ['Includes servers with a nonempty name that responded within the last 6 hours. Empty and passworded servers are included. This is not the full tracked-server list.']
    },
    {
        name: 'GetFilteredServers', group: 'Servers', description: 'Search, filter, sort, and paginate recently online servers.',
        parameters: [
            flag('show_empty', 'Include servers with no players.'),
            { name: 'order', type: 'string', default: 'none', options: ['none', 'players', 'ratio'], description: 'none uses the shuffled order; players sorts by player count descending. Any other string uses occupancy ratio ordering. This value is case-sensitive.' },
            { name: 'name', type: 'string', default: 'unspecified', description: 'Case-insensitive substring of the server name. unspecified disables this filter.' },
            { name: 'gamemode', type: 'string', default: 'unspecified', description: 'Case-insensitive substring of the gamemode. unspecified disables this filter.' },
            flag('hide_roleplay', 'Hide servers identified as roleplay by name or gamemode.'),
            { name: 'paging_size', type: 'integer', default: '0', description: 'Results per page. Values <= 0 disable pagination.' },
            { name: 'page', type: 'integer', default: '0', description: 'Zero-based page index. Used only when paging_size > 0.' },
            { name: 'version', type: 'string', default: 'any', description: 'Case-insensitive version substring. any disables this filter.' },
            { name: 'language', type: 'string', default: 'any', description: 'Case-insensitive language substring. any disables this filter.' },
            flag('require_sampcac', 'Exclude servers whose sampCac value contains “not required”.'),
            flag('show_passworded', 'Include password-protected servers.'),
            flag('only_openmp', 'Include only open.mp servers.')
        ], response: '200 · Server[]', schema: `Array of Server objects:\n${serverSchema}`,
        notes: ['By default, empty and passworded servers are excluded.', 'Pagination returns a plain array without a total count or next-page token. No matches return [].']
    },
    {
        name: 'GetServerByIP', group: 'Servers', description: 'Look up a tracked server, including one that is currently offline.',
        parameters: [address], response: '200 · Server; 204 · Not found', schema: serverSchema,
        notes: ['An unknown address returns HTTP 204 with no body.']
    },
    {
        name: 'GetServerPlayers', group: 'Servers', description: 'Get the player list for a tracked server.',
        parameters: [address], response: '200 · Player[]',
        schema: `[{\n  id: integer,\n  ping: integer,\n  name: string,\n  score: integer\n}]`,
        notes: ['Successful player lists are cached for 3 minutes. A failed query can return the previous cached list.', 'Unknown servers or unavailable player data return []. SA-MP servers with more than 100 players may not provide a player list.']
    },
    {
        name: 'GetServerMetrics', group: 'Metrics', description: 'Get historical player counts for a tracked server.',
        parameters: [
            { ...address, required: false, default: 'none' }, hours,
            { name: 'include_misses', type: 'integer', default: '0', options: ['0', '1'], description: 'Values > 0 include failed queries, recorded as negative player counts. Values <= 0 omit them.' }
        ], response: '200 · ServerMetrics[]', schema: `[{\n  players: integer,\n  time: ISO 8601 date-time string\n}]`,
        notes: ['Results are newest first. Unknown addresses normally return [].', 'The cutoff uses the API host’s local clock (DateTime.Now), whereas GetGlobalMetrics uses UTC.']
    },
    {
        name: 'GetGlobalMetrics', group: 'Metrics', description: 'Get historical player, server, and open.mp server counts.',
        parameters: [hours, { name: 'skip_trimming', type: 'boolean', default: 'false', options: ['false', 'true'], description: 'Return all stored samples without averaging. Use true/false, not 1/0.' }],
        response: '200 · GlobalMetrics[]', schema: `[{\n  players: integer,\n  servers: integer,\n  ompServers: integer,\n  time: ISO 8601 date-time string\n}]`,
        notes: ['Samples are recorded every 30 minutes and returned newest first.', 'At 750 or more matching samples, the default response averages groups of floor(sample count / 500) samples. Counts are truncated to integers and each group uses its first timestamp.']
    },
    {
        name: 'GetGlobalStats', group: 'Statistics', description: 'Get the current aggregate server and player counts.',
        parameters: [], response: '200 · GlobalStats',
        schema: `{
  playersOnline: integer,
  serversTracked: integer,
  serversOnline: integer,
  serversInhabited: integer,
  serversOnlineOMP: integer
}`,
        notes: ['Statistics refresh every 5 minutes. serversTracked includes offline tracked servers; the other counts use recently online servers.', 'serversOnlineOMP is the published JSON field name, including uppercase OMP.']
    },
    {
        name: 'GetLanguageStats', group: 'Statistics', description: 'Get server and player counts grouped by language.',
        parameters: [], response: '200 · LanguageStats',
        schema: `{
  spanish: { amount: integer, players: integer },
  russian: { amount: integer, players: integer },
  english: { amount: integer, players: integer },
  romanian: { amount: integer, players: integer },
  portuguese: { amount: integer, players: integer },
  asia: { amount: integer, players: integer },
  eastEuro: { amount: integer, players: integer },
  westEuro: { amount: integer, players: integer },
  other: { amount: integer, players: integer }
}`, notes: categoryNotes
    },
    {
        name: 'GetGamemodeStats', group: 'Statistics', description: 'Get server and player counts grouped by gamemode.',
        parameters: [], response: '200 · GamemodeStats',
        schema: `{
  deathmatch: { amount: integer, players: integer },
  roleplay: { amount: integer, players: integer },
  raceStunt: { amount: integer, players: integer },
  cnr: { amount: integer, players: integer },
  freeRoam: { amount: integer, players: integer },
  survival: { amount: integer, players: integer },
  vehSim: { amount: integer, players: integer },
  other: { amount: integer, players: integer }
}`, notes: categoryNotes
    },
    {
        name: 'GetMasterlist', group: 'Lists', description: 'Get newline-separated server addresses for a game client.',
        parameters: [{ name: 'version', type: 'string', default: 'any', description: 'any returns the cached global list; values containing 3.7 or uppercase DL select cached version lists. Other values use case-sensitive substring matching.' }],
        response: '200 · Plain text',
        notes: ['Each line is an IPv4 address with a port. Cached lists refresh every 30 minutes and exclude passworded servers.', 'Custom version substring lists are generated from recently online servers and do not apply the password filter.']
    },
    {
        name: 'GetEveryIP', group: 'Lists', description: 'Get newline-separated addresses of every tracked server.',
        parameters: [], response: '200 · Plain text', notes: ['Includes offline tracked servers. Each line is an IPv4 address with a port.']
    },
    {
        name: 'AddServer', group: 'Servers', description: 'Submit a server for monitoring. This GET request changes data.', mutates: true,
        parameters: [{ name: 'ip_addr', type: 'string', required: true, placeholder: 'server.example.com:7777', description: 'IPv4 address or resolvable hostname with an optional port (1–65535). The default port is 7777; hostnames resolve to IPv4.' }],
        response: '200 · Plain text result; 503 · Rate limit rejection',
        notes: ['A shared limiter allows 40 requests per 60-second window, with 2 queued requests. The backend’s default rejection status is 503.', 'HTTP 200 does not guarantee success. Read the message: “Server added to SAMonitor.” means success; other messages describe invalid addresses, duplicates, blacklist entries, failed queries, unsupported CR-MP servers, or database failures.']
    }
];

export function getEndpointParams(endpoint: ApiEndpoint, values: Record<string, string>) {
    return Object.fromEntries(endpoint.parameters
        .filter(parameter => values[parameter.name]?.trim())
        .map(parameter => [parameter.name, values[parameter.name].trim()]));
}

export function formatResponse(body: string): string {
    if (!body) return '(empty body)';
    try {
        return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
        return body;
    }
}

export function curlCommand(url: string): string {
    return `curl '${url.replace(/'/g, "'\\''")}'`;
}
