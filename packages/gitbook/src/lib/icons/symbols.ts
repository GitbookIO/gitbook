import 'server-only';

import type { StyleIconSymbolManifest } from './types';

const loaders = {
    brands: () =>
        import('../../../.generated/icon-symbols/brands.json', { with: { type: 'json' } }),
    'custom-icons': () =>
        import('../../../.generated/icon-symbols/custom-icons.json', {
            with: { type: 'json' },
        }),
    duotone: () =>
        import('../../../.generated/icon-symbols/duotone.json', { with: { type: 'json' } }),
    light: () => import('../../../.generated/icon-symbols/light.json', { with: { type: 'json' } }),
    regular: () =>
        import('../../../.generated/icon-symbols/regular.json', { with: { type: 'json' } }),
    'sharp-duotone-solid': () =>
        import('../../../.generated/icon-symbols/sharp-duotone-solid.json', {
            with: { type: 'json' },
        }),
    'sharp-light': () =>
        import('../../../.generated/icon-symbols/sharp-light.json', { with: { type: 'json' } }),
    'sharp-regular': () =>
        import('../../../.generated/icon-symbols/sharp-regular.json', {
            with: { type: 'json' },
        }),
    'sharp-solid': () =>
        import('../../../.generated/icon-symbols/sharp-solid.json', { with: { type: 'json' } }),
    'sharp-thin': () =>
        import('../../../.generated/icon-symbols/sharp-thin.json', { with: { type: 'json' } }),
    solid: () => import('../../../.generated/icon-symbols/solid.json', { with: { type: 'json' } }),
    thin: () => import('../../../.generated/icon-symbols/thin.json', { with: { type: 'json' } }),
} satisfies Record<string, () => Promise<{ default: StyleIconSymbolManifest }>>;

type SupportedSymbolStyle = keyof typeof loaders;

const manifestPromises = new Map<string, Promise<StyleIconSymbolManifest>>();

function escapeAttribute(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

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
        (module) => module.default
    );
    manifestPromises.set(style, manifestPromise);

    return manifestPromise;
}

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
