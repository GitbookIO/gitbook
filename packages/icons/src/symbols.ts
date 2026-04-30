export type IconRenderMode = 'mask' | 'symbol';

export interface RegisteredIconSymbol {
    style: string;
    icon: string;
    symbolId: string;
    assetURL?: string;
}

const REGISTERED_SYMBOLS_KEY = Symbol.for('gitbook.icons.registeredSymbols');
const PREFETCHED_ICON_ASSETS_KEY = Symbol.for('gitbook.icons.prefetchedAssets');

function sanitizeSymbolFragment(fragment: string): string {
    return fragment.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * Build the DOM id used by both SSR-emitted symbols and the lazy symbol loader.
 */
export function getIconSymbolId(style: string, icon: string): string {
    return `gb-icon-${sanitizeSymbolFragment(style)}-${sanitizeSymbolFragment(icon)}`;
}

function getRegisteredSymbolsStore(): Map<string, RegisteredIconSymbol> {
    const store = globalThis as typeof globalThis & {
        [REGISTERED_SYMBOLS_KEY]?: Map<string, RegisteredIconSymbol>;
    };

    if (!store[REGISTERED_SYMBOLS_KEY]) {
        store[REGISTERED_SYMBOLS_KEY] = new Map<string, RegisteredIconSymbol>();
    }

    return store[REGISTERED_SYMBOLS_KEY];
}

function getPrefetchedAssetsStore(): Map<string, Promise<void>> {
    const store = globalThis as typeof globalThis & {
        [PREFETCHED_ICON_ASSETS_KEY]?: Map<string, Promise<void>>;
    };

    if (!store[PREFETCHED_ICON_ASSETS_KEY]) {
        store[PREFETCHED_ICON_ASSETS_KEY] = new Map<string, Promise<void>>();
    }

    return store[PREFETCHED_ICON_ASSETS_KEY];
}

function shouldTrackSymbolRegistrations() {
    const runtime = globalThis as typeof globalThis & { Bun?: unknown };

    return typeof window === 'undefined' || typeof runtime.Bun !== 'undefined';
}

/**
 * Record a symbol used during server rendering so the app can emit a deduplicated sprite subset.
 */
export function registerServerIconSymbol(symbol: RegisteredIconSymbol): void {
    if (!shouldTrackSymbolRegistrations()) {
        return;
    }

    getRegisteredSymbolsStore().set(`${symbol.style}/${symbol.icon}`, symbol);
}

/**
 * Start fetching a raw SVG asset during SSR so sprite generation can reuse the in-flight or warm
 * request instead of waiting until the end of the render.
 */
export function prefetchServerIconAsset(assetURL: string): void {
    if (typeof window !== 'undefined') {
        return;
    }

    const prefetchedAssets = getPrefetchedAssetsStore();
    if (prefetchedAssets.has(assetURL)) {
        return;
    }

    const request = fetch(assetURL, { cache: 'force-cache' })
        .then(() => undefined)
        .catch(() => undefined);

    prefetchedAssets.set(assetURL, request);
}

/**
 * Return the currently registered server-rendered symbols in insertion order.
 */
export function getRegisteredServerIconSymbols(): RegisteredIconSymbol[] {
    return [...getRegisteredSymbolsStore().values()];
}

/**
 * Reset the per-request symbol registry after the sprite subset has been emitted.
 */
export function clearRegisteredServerIconSymbols(): void {
    getRegisteredSymbolsStore().clear();
}
