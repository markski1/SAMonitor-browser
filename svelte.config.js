import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      // The /server/[ip] route is fully client-rendered (server returns no
      // HTML for it). `fallback` produces a 200.html that the SvelteKit
      // client uses to take over routing for unknown paths.
      fallback: '200.html',
      precompress: false,
      strict: true
    }),
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
