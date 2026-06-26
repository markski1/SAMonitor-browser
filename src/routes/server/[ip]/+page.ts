// Server detail pages cannot be prerendered (the IP is dynamic), so disable
// prerendering and SSR; the page is fully client-rendered.
export const prerender = false;
export const ssr = false;
