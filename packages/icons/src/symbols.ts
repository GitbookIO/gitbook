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

export function getIconSymbolId(prefix: string | undefined, style: string, icon: string): string {
    const basePrefix = prefix ?? 'gb-icon-';

    return `${sanitizeSymbolFragment(basePrefix)}${sanitizeSymbolFragment(style)}-${sanitizeSymbolFragment(icon)}`;
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

export function registerServerIconSymbol(symbol: RegisteredIconSymbol): void {
    if (!shouldTrackSymbolRegistrations()) {
        return;
    }

    getRegisteredSymbolsStore().set(`${symbol.style}/${symbol.icon}`, symbol);
}

export function getRegisteredServerIconSymbols(): RegisteredIconSymbol[] {
    return [...getRegisteredSymbolsStore().values()];
}

export function clearRegisteredServerIconSymbols(): void {
    getRegisteredSymbolsStore().clear();
}
