import { expect, it } from 'vitest';
import { getMetaTags, getPageMetadata, renderPreviewMetadata } from './metadata.js';

it('provides complete previews for every public page', () => {
    for (const path of ['/', '/statistics', '/add', '/masterlist', '/blacklist', '/about', '/api', '/server/1.2.3.4:7777']) {
        const metadata = getPageMetadata(path);
        const tags = getMetaTags(metadata);
        expect(metadata.title).toMatch(/^SAMonitor - /);
        expect(metadata.description.length).toBeGreaterThan(20);
        expect(metadata.url).toBe(`https://sam.markski.ar${path}`);
        expect(metadata.image).toBe('https://sam.markski.ar/logo256.webp');
        expect(tags.find(tag => tag.property === 'og:title')?.content).toBe(metadata.title);
        expect(tags.find(tag => tag.property === 'og:description')?.content).toBe(metadata.description);
        expect(tags.find(tag => tag.name === 'twitter:description')?.content).toBe(metadata.description);
    }
});

it('renders a generic server preview without a shared canonical URL', () => {
    const metadata = getPageMetadata('/server/');
    metadata.url = '';
    const html = renderPreviewMetadata(metadata);
    expect(html).toContain('SAMonitor - Server page');
    expect(html).toContain('View server details, player activity, and history on SAMonitor.');
    expect(html).toContain('name="twitter:card" content="summary"');
    expect(html).not.toContain('og:url');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('content=""');
});
