import { CustomizationDefaultFont } from '@gitbook/api';
import { type FontWeight, getDefaultFont } from '@gitbook/fonts';

import { getFontSourcesToPreload } from '@/fonts/custom';
import type { GitBookSiteContext } from '@/lib/context';
import { filterOutNullable } from '@/lib/typescript';
import QuickLRU from 'quick-lru';

type ComputeFontsInput = {
    regularText: string;
    boldText: string;
};

// Google fonts are more likely to be reused, so we keep a larger cache
const googleFontsCache = new QuickLRU<string, unknown>({ maxSize: 50 });

// Custom fonts are less likely to be reused, so we keep a smaller cache
const customFontsCache = new QuickLRU<string, unknown>({ maxSize: 10 });

export async function computeImageFonts(
    customization: GitBookSiteContext['customization'],
    input: ComputeFontsInput
) {
    // Google fonts
    if (typeof customization.styling.font === 'string') {
        const fontFamily = customization.styling.font ?? CustomizationDefaultFont.Inter;

        const fonts = (
            await Promise.all([
                loadGoogleFont({ font: fontFamily, text: input.regularText, weight: 400 }),
                loadGoogleFont({ font: fontFamily, text: input.boldText, weight: 700 }),
            ])
        ).filter(filterOutNullable);

        return { fontFamily, fonts } as const;
    }

    // Custom fonts
    // We only load the primary font weights for now
    const primaryFontWeights = getFontSourcesToPreload(customization.styling.font);

    const fonts = (
        await Promise.all(
            primaryFontWeights.map((face) => {
                const { weight, sources } = face;
                const source = sources[0];

                // Satori doesn't support WOFF2, so we skip it
                // https://github.com/vercel/satori?tab=readme-ov-file#fonts
                if (!source || source.format === 'woff2' || source.url.endsWith('.woff2')) {
                    return null;
                }

                return loadCustomFont({ url: source.url, weight: weight as 400 | 700 });
            })
        )
    ).filter(filterOutNullable);

    return { fontFamily: 'CustomFont', fonts } as const;
}

async function loadGoogleFont(input: {
    font: CustomizationDefaultFont;
    text: string;
    weight: FontWeight;
}) {
    const lookup = getDefaultFont({
        font: input.font,
        text: input.text,
        weight: input.weight,
    });

    // If we found a font file, load it
    if (lookup) {
        return getWithCache(googleFontsCache, lookup.url, async () => {
            const response = await fetch(lookup.url);
            if (!response.ok) {
                throw new Error(`Failed to load font from ${lookup.url}: ${response.statusText}`);
            }
            const data = await response.arrayBuffer();
            return {
                name: lookup.font,
                data,
                style: 'normal' as const,
                weight: input.weight,
            };
        });
    }

    // If for some reason we can't load the font, we'll just use the default one
    return null;
}

async function loadCustomFont(input: { url: string; weight: 400 | 700 }) {
    const { url, weight } = input;
    return getWithCache(customFontsCache, `${url}:${weight}`, async () => {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load custom font from ${url}: ${response.statusText}`);
        }

        const data = await response.arrayBuffer();

        return {
            name: 'CustomFont',
            data,
            style: 'normal' as const,
            weight,
        } as const;
    });
}

/**
 * Simple in-memory cache to avoid loading the same font multiple times.
 */
function getWithCache<T>(
    cache: QuickLRU<string, unknown>,
    key: string,
    fn: () => Promise<T>
): Promise<T> {
    const cached = cache.get(key);
    if (cached) {
        return cached as Promise<T>;
    }

    const promise = fn().catch((error) => {
        // Remove the failed promise from cache so it can be retried
        cache.delete(key);
        throw error;
    });
    cache.set(key, promise);
    return promise;
}
