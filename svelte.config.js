import staticAdapter from './scripts/static-adapter.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: staticAdapter(),
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
