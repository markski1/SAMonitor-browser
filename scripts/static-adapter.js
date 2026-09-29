import adapter from '@sveltejs/adapter-static';
import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { getPageMetadata, renderPreviewMetadata } from '../src/lib/metadata.js';

export default function staticAdapter() {
    const base = adapter({ pages: 'build', assets: 'build', fallback: '200.html', strict: true });
    return {
        ...base,
        /** @param {import('@sveltejs/kit').Builder} builder */
        async adapt(builder) {
            await base.adapt(builder);
            const siteUrl = loadEnv('production', process.cwd(), 'VITE_').VITE_SITE_URL;
            const fallback = await readFile('build/200.html', 'utf8');
            const metadata = getPageMetadata('/server/', siteUrl);
            metadata.url = '';
            await writeFile('build/200.html', fallback.replace(
                '<!--samonitor:metadata-->', renderPreviewMetadata(metadata)
            ));
        }
    };
}
