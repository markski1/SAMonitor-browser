import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import staticAdapter from './scripts/static-adapter.js';

export default defineConfig({
  plugins: [sveltekit({
    preprocess: vitePreprocess(),
    adapter: staticAdapter(),
    alias: { $lib: 'src/lib' }
  })]
});
