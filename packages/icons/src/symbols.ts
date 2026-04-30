export type IconRenderMode = 'mask' | 'symbol';

export interface RegisteredIconSymbol {
    style: string;
    icon: string;
    symbolId: string;
}

const REGISTERED_SYMBOLS_KEY = Symbol.for('gitbook.icons.registeredSymbols');

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
