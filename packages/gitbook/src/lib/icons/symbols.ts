import 'server-only';

import { getAssetURL } from '@/lib/assets';
import { GITBOOK_RUNTIME } from '@/lib/env';
import { joinPath } from '@/lib/paths';

interface IconSymbolSource {
    viewBox: string;
    markup: string;
}

const symbolSources = new Map<string, Promise<IconSymbolSource | null>>();
const symbolPattern = /<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/i;
const viewBoxPattern = /\bviewBox="([^"]+)"/i;

function escapeAttribute(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

/**
 * Build the path to a generated static symbol document.
 */
function getStaticSymbolPath(style: string, icon: string): string {
    return joinPath('icon-symbols', style, `${icon}.svg`);
}

function buildSymbolMarkup(symbolId: string, viewBox: string, markup: string) {
    return `<symbol id="${escapeAttribute(symbolId)}" viewBox="${escapeAttribute(viewBox)}" overflow="visible">${markup}</symbol>`;
}

function buildSymbolDocument(symbolId: string, symbol: string) {
    return `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbol}</defs><use href="#${escapeAttribute(symbolId)}"/></svg>`;
}

function parseSymbolDocument(document: string): IconSymbolSource | null {
    const symbolMatch = document.match(symbolPattern);
    if (!symbolMatch) {
        return null;
    }

    const symbolAttributes = symbolMatch[1];
    const rawMarkup = symbolMatch[2];
    if (!symbolAttributes || rawMarkup === undefined) {
        return null;
    }

    const viewBoxMatch = symbolAttributes.match(viewBoxPattern);
    if (!viewBoxMatch) {
        return null;
    }
    const viewBox = viewBoxMatch[1];
    if (!viewBox) {
        return null;
    }

    return {
        viewBox,
        markup: rawMarkup.trim(),
    };
}

async function readLocalSymbolDocument(style: string, icon: string): Promise<string | null> {
    const [{ readFile }, path] = await Promise.all([
        import('node:fs/promises'),
        import('node:path'),
    ]);

    try {
        return await readFile(
            path.resolve(
                process.cwd(),
                'public',
                '~gitbook',
                'static',
                'icon-symbols',
                style,
                `${icon}.svg`
            ),
            'utf8'
        );
    } catch {
        return null;
    }
}

async function fetchSymbolDocument(style: string, icon: string): Promise<string | null> {
    try {
        const response = await fetch(getAssetURL(getStaticSymbolPath(style, icon)));
        if (!response.ok) {
            return null;
        }

        return response.text();
    } catch {
        return null;
    }
}

async function loadSymbolSource(style: string, icon: string): Promise<IconSymbolSource | null> {
    const cacheKey = `${style}/${icon}`;
    const existing = symbolSources.get(cacheKey);
    if (existing) {
        return existing;
    }

    const sourcePromise = (async () => {
        const document =
            (GITBOOK_RUNTIME === 'cloudflare'
                ? null
                : await readLocalSymbolDocument(style, icon)) ??
            (await fetchSymbolDocument(style, icon));
        if (!document) {
            return null;
        }

        return parseSymbolDocument(document);
    })();
    symbolSources.set(cacheKey, sourcePromise);

    return sourcePromise;
}

/**
 * Resolve one icon entry from the generated static symbol assets and serialize it for sprite
 * injection or lazy-loading.
 */
export async function getIconSymbol(style: string, icon: string, symbolId: string) {
    const source = await loadSymbolSource(style, icon);
    if (!source) {
        return null;
    }

    const symbol = buildSymbolMarkup(symbolId, source.viewBox, source.markup);

    return {
        style,
        icon,
        symbolId,
        viewBox: source.viewBox,
        markup: source.markup,
        symbol,
        document: buildSymbolDocument(symbolId, symbol),
    };
}
