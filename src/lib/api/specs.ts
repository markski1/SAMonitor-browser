export interface ApiParameter {
    name: string;
    type: 'string' | 'integer' | 'boolean';
    description: string;
    default?: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
    hint?: string;
}

export interface ApiEndpoint {
    name: string;
    method?: 'GET' | 'POST';
    parameterLocation?: 'query' | 'body';
    group: string;
    description: string;
    parameters: ApiParameter[];
    response: string;
    schema?: string;
    statuses?: { code: number; description: string }[];
    notes: string[];
    mutates?: boolean;
}

const address: ApiParameter = {
    name: 'ip_addr', type: 'string', required: true, placeholder: '203.0.113.10:7777',
    description: 'Server IP and optional port.'
};

const hours: ApiParameter = {
    name: 'hours', type: 'integer', default: '6',
    description: 'Hours of history.'
};

function flag(name: string, description: string): ApiParameter {
    return { name, type: 'integer', default: '0', options: ['0', '1'], description };
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

const categoryNotes = ['amount counts servers. Categories use text matching.'];

export const apiEndpoints: ApiEndpoint[] = [
    {
        name: 'GetAllServers', group: 'Servers', description: 'Recently online servers.',
        parameters: [], response: '200 · Server[]', schema: `Array of Server objects:\n${serverSchema}`,
        notes: ['Online within 6 hours. Includes empty and passworded servers.']
    },
    {
        name: 'GetFilteredServers', group: 'Servers', description: 'Filtered server list.',
        parameters: [
            flag('show_empty', 'Include empty servers.'),
            { name: 'order', type: 'string', default: 'none', options: ['none', 'players', 'ratio'], description: 'none: shuffled; players: most players; ratio: fullest first.' },
            { name: 'name', type: 'string', default: 'unspecified', description: 'Name substring.' },
            { name: 'gamemode', type: 'string', default: 'unspecified', description: 'Gamemode substring.' },
            flag('hide_roleplay', 'Hide roleplay servers.'),
            { name: 'paging_size', type: 'integer', default: '0', description: 'Page size; <= 0 returns all results.' },
            { name: 'page', type: 'integer', default: '0', description: 'Page index, starting at 0.' },
            { name: 'version', type: 'string', default: 'any', description: 'Version substring.' },
            { name: 'language', type: 'string', default: 'any', description: 'Language substring.' },
            flag('require_sampcac', 'Exclude “not required” SAMPCAC values.'),
            flag('show_passworded', 'Include passworded servers.'),
            flag('only_openmp', 'Only open.mp servers.')
        ], response: '200 · Server[]', schema: `Array of Server objects:\n${serverSchema}`,
        notes: ['Empty and passworded servers are hidden by default. Text filters ignore case. Pagination has no total count.']
    },
    {
        name: 'GetServerByIP', group: 'Servers', description: 'Server details, including offline servers.',
        parameters: [address], response: '200 · Server; 204 · Not found', schema: serverSchema,
        notes: []
    },
    {
        name: 'GetServerPlayers', group: 'Servers', description: 'Server player list.',
        parameters: [address], response: '200 · Player[]',
        schema: `[{\n  id: integer,\n  ping: integer,\n  name: string,\n  score: integer\n}]`,
        notes: ['Cached for 3 minutes; failed queries may return stale data. Unavailable lists return []. SA-MP may omit lists above 100 players.']
    },
    {
        name: 'GetServerMetrics', group: 'Metrics', description: 'Server player history.',
        parameters: [
            { ...address, required: false, default: 'none' }, hours,
            { name: 'include_misses', type: 'integer', default: '0', options: ['0', '1'], description: 'Include failed queries (negative player counts).' }
        ], response: '200 · ServerMetrics[]', schema: `[{\n  players: integer,\n  time: ISO 8601 date-time string\n}]`,
        notes: ['Newest first. Unknown servers return [].']
    },
    {
        name: 'GetGlobalMetrics', group: 'Metrics', description: 'Global player and server history.',
        parameters: [hours, { name: 'skip_trimming', type: 'boolean', default: 'false', options: ['false', 'true'], description: 'Return unaveraged samples.' }],
        response: '200 · GlobalMetrics[]', schema: `[{\n  players: integer,\n  servers: integer,\n  ompServers: integer,\n  time: ISO 8601 date-time string\n}]`,
        notes: ['30-minute samples, newest first. At 750+ samples, averages reduce the response to at most 500 points.']
    },
    {
        name: 'GetGlobalStats', group: 'Statistics', description: 'Current player and server counts.',
        parameters: [], response: '200 · GlobalStats',
        schema: `{
  playersOnline: integer,
  serversTracked: integer,
  serversOnline: integer,
  serversInhabited: integer,
  serversOnlineOMP: integer
}`,
        notes: ['Updates every 5 minutes. serversTracked includes offline servers.']
    },
    {
        name: 'GetLanguageStats', group: 'Statistics', description: 'Counts by language.',
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
        name: 'GetGamemodeStats', group: 'Statistics', description: 'Counts by gamemode.',
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
        name: 'GetMasterlist', group: 'Lists', description: 'Client masterlist, one address per line.',
        parameters: [{ name: 'version', type: 'string', default: 'any', description: 'any, 3.7, DL, or a case-sensitive version substring.' }],
        response: '200 · Plain text',
        notes: ['Excludes passworded servers. Cached lists refresh every 30 minutes.']
    },
    {
        name: 'GetEveryIP', group: 'Lists', description: 'All tracked addresses, one per line.',
        parameters: [], response: '200 · Plain text', notes: ['Includes offline servers.']
    },
    {
        name: 'AddServer', method: 'POST', parameterLocation: 'body', group: 'Servers', description: 'Add a server.', mutates: true,
        parameters: [{ name: 'ipAddr', type: 'string', required: true, placeholder: 'server.example.com:7777', hint: 'Default port: 7777.', description: 'IP or hostname, with optional port.' }],
        response: '201 · AddServerResponse',
        schema: '{\n  ipAddr: string,\n  message: string\n}',
        statuses: [
            { code: 201, description: 'Added; Location links to the server.' },
            { code: 400, description: 'Invalid address or JSON.' },
            { code: 403, description: 'Blacklisted.' },
            { code: 409, description: 'Already monitored or duplicate.' },
            { code: 415, description: 'Requires application/json.' },
            { code: 422, description: 'Query failed or server unsupported.' },
            { code: 429, description: 'Rate limited; see Retry-After.' },
            { code: 500, description: 'Server error.' }
        ],
        notes: ['Errors use Problem Details. Limit: 40 requests/minute, shared with legacy GET.', 'Legacy GET uses ?ip_addr=address and returns plain text.']
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

export function curlCommand(url: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, string>): string {
    const command = method === 'POST' ? 'curl -X POST' : 'curl';
    const quote = (value: string) => "'" + value.replace(/'/g, "'\\''") + "'";
    const data = body ? ` -H 'Content-Type: application/json' -d ${quote(JSON.stringify(body))}` : '';
    return `${command}${data} ${quote(url)}`;
}
