/**
 * Normalize a website URL so it always has a scheme.
 * Either OMP or something in how I fetch these at the api fucks it all up since recently.
 */
export function normalizeWebsiteUrl(input: string): string {
    if (input.includes('://')) return input;
    if (input.includes('http')) return input;
    return `https://${input}`;
}
