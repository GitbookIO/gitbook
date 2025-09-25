import { CustomizationDefaultFont } from '@gitbook/api';
import { type FontWeight, getDefaultFont } from '@gitbook/fonts';

import { getFontSourcesToPreload } from '@/fonts/custom';
import type { GitBookSiteContext } from '@/lib/context';
import { filterOutNullable } from '@/lib/typescript';

type ComputeFontsInput = {
    regularText: string;
    boldText: string;
};

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
        return getWithCache(`google-font-files:${lookup.url}`, async () => {
            const response = await fetch(lookup.url);
            if (response.ok) {
                const data = await response.arrayBuffer();
                return {
                    name: lookup.font,
                    data,
                    style: 'normal' as const,
                    weight: input.weight,
                };
            }
        });
    }

    // If for some reason we can't load the font, we'll just use the default one
    return null;
}

async function loadCustomFont(input: { url: string; weight: 400 | 700 }) {
    const { url, weight } = input;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.arrayBuffer();

    return {
        name: 'CustomFont',
        data,
        style: 'normal' as const,
        weight,
    } as const;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const staticCache = new Map<string, any>();

async function getWithCache<T>(key: string, fn: () => Promise<T>) {
    const cached = staticCache.get(key) as Promise<T>;
    if (cached) {
        return cached;
    }

    const promise = fn();
    staticCache.set(key, promise);

    try {
        const result = await promise;
        return result;
    } catch (error) {
        // Remove the failed promise from cache so it can be retried
        staticCache.delete(key);
        throw error;
    }
}
