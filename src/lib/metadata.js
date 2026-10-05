export const DEFAULT_SITE_URL = 'https://sam.markski.ar';

const pages = {
    '/': ['Home', 'Browse SA-MP and open.mp servers, player activity, and server statistics.'],
    '/statistics': ['Statistics', 'Player counts, server counts, and activity trends across SA-MP and open.mp.'],
    '/api': ['API', 'Explore the SAMonitor API, endpoint specifications, and an interactive request playground.'],
    '/add': ['Add server', 'Add your SA-MP or open.mp server to SAMonitor.'],
    '/masterlist': ['Masterlist', "Use SAMonitor as your SA-MP client's masterlist."],
    '/blacklist': ['Blacklist', 'Information about servers blacklisted from SAMonitor.'],
    '/about': ['About', 'Learn about SAMonitor, the free and open source SA-MP and open.mp server monitor.']
};

/** @typedef {{ title: string, description: string, url: string, image: string }} Metadata */
/**
 * @param {string} pathname
 * @param {string} [siteUrl]
 * @returns {Metadata}
 */
export function getPageMetadata(pathname, siteUrl = DEFAULT_SITE_URL) {
    const origin = new URL(siteUrl).origin;
    const path = pathname.replace(/\/$/, '') || '/';
    let [label, description] = pages[/** @type {keyof typeof pages} */ (path)] ??
        ['Server browser', 'Browse SA-MP and open.mp servers on SAMonitor.'];
    if (path === '/server' || path.startsWith('/server/')) {
        label = 'Server page';
        description = 'View server details, player activity, and history on SAMonitor.';
    }

    return {
        title: `SAMonitor - ${label}`,
        description,
        url: new URL(path, origin).href,
        image: new URL('/logo256.webp', origin).href
    };
}

/** @param {Metadata} metadata */
export function getMetaTags(metadata) {
    return [
        { name: 'description', content: metadata.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SAMonitor' },
        { property: 'og:title', content: metadata.title },
        { property: 'og:description', content: metadata.description },
        ...(metadata.url ? [{ property: 'og:url', content: metadata.url }] : []),
        { property: 'og:image', content: metadata.image },
        { property: 'og:image:width', content: '256' },
        { property: 'og:image:height', content: '256' },
        { property: 'og:image:alt', content: 'SAMonitor logo' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: metadata.title },
        { name: 'twitter:description', content: metadata.description },
        { name: 'twitter:image', content: metadata.image },
        { name: 'twitter:image:alt', content: 'SAMonitor logo' }
    ];
}

/** @param {string} value */
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character] ?? character);
}

/** @param {Metadata} metadata */
export function renderPreviewMetadata(metadata) {
    const tags = getMetaTags(metadata).map(tag => {
        const key = 'property' in tag ? 'property' : 'name';
        return `<meta data-samonitor-preview ${key}="${tag[key]}" content="${escapeHtml(tag.content)}">`;
    });
    return `<title data-samonitor-preview>${escapeHtml(metadata.title)}</title>\n` +
        (metadata.url ? `<link data-samonitor-preview rel="canonical" href="${escapeHtml(metadata.url)}">\n` : '') +
        tags.join('\n');
}
