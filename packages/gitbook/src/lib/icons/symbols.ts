import 'server-only';

import { loaders } from '../../../.generated/icon-symbol-loaders';
import type { StyleIconSymbolManifest } from './types';

type SupportedSymbolStyle = keyof typeof loaders;

const manifestPromises = new Map<string, Promise<StyleIconSymbolManifest>>();

function escapeAttribute(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

/**
 * Load and memoize the generated symbol manifest for a Font Awesome style.
 */
export async function getIconStyleManifest(style: string): Promise<StyleIconSymbolManifest | null> {
    const load = loaders[style as SupportedSymbolStyle];
    if (!load) {
        return null;
    }

    const existing = manifestPromises.get(style);
    if (existing) {
        return existing;
    }

    const manifestPromise: Promise<StyleIconSymbolManifest> = load().then(
        (module) => module.default as StyleIconSymbolManifest
    );
    manifestPromises.set(style, manifestPromise);

    return manifestPromise;
}

/**
 * Resolve one icon entry from the generated manifest and serialize it for sprite injection or
 * lazy-loading through the symbol route.
 */
export async function getIconSymbol(style: string, icon: string, symbolId: string) {
    const manifest = await getIconStyleManifest(style);
    const entry = manifest?.[icon];
    if (!entry) {
        return null;
    }

    const symbol = `<symbol id="${escapeAttribute(symbolId)}" viewBox="${escapeAttribute(entry.viewBox)}" overflow="visible">${entry.markup}</symbol>`;

    return {
        style,
        icon,
        symbolId,
        viewBox: entry.viewBox,
        markup: entry.markup,
        symbol,
        document: `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbol}</defs><use href="#${escapeAttribute(symbolId)}"/></svg>`,
    };
}
