import 'server-only';

import { getAssetURL } from '@/lib/assets';
import { GITBOOK_ICONS_TOKEN, GITBOOK_ICONS_URL } from '@/lib/env';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';

const ICON_ASSET_VERSION = '2';
const rawSvgPromises = new Map<string, Promise<string | null>>();
const svgPattern = /<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i;
const viewBoxPattern = /\bviewBox="([^"]+)"/i;
const commentPattern = /<!--[\s\S]*?-->/g;

interface IconSymbolSource {
    viewBox: string;
    markup: string;
}

function escapeAttribute(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function getIconAssetBaseURL(style: string): string {
    if (style === 'custom-icons') {
        return getAssetURL('icons');
    }

    return GITBOOK_ICONS_URL;
}

function getIconAssetURL(style: string, icon: string): string {
    const url = new URL(
        joinPathWithBaseURL(getIconAssetBaseURL(style), joinPath('svgs', style, `${icon}.svg`))
    );
    url.searchParams.set('v', ICON_ASSET_VERSION);

    if (style !== 'custom-icons' && GITBOOK_ICONS_TOKEN) {
        url.searchParams.set('token', GITBOOK_ICONS_TOKEN);
    }

    return url.toString();
}

function parseRawSVG(document: string): IconSymbolSource | null {
    const svgMatch = document.match(svgPattern);
    if (!svgMatch) {
        return null;
    }

    const svgAttributes = svgMatch[1];
    const rawMarkup = svgMatch[2];
    if (!svgAttributes || rawMarkup === undefined) {
        return null;
    }

    const viewBoxMatch = svgAttributes.match(viewBoxPattern);
    const viewBox = viewBoxMatch?.[1];
    if (!viewBox) {
        return null;
    }

    return {
        viewBox,
        markup: rawMarkup.replace(commentPattern, '').trim(),
    };
}

function buildSymbolMarkup(symbolId: string, viewBox: string, markup: string) {
    return `<symbol id="${escapeAttribute(symbolId)}" viewBox="${escapeAttribute(viewBox)}" overflow="visible">${markup}</symbol>`;
}

function buildSymbolDocument(symbolId: string, symbol: string) {
    return `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbol}</defs><use href="#${escapeAttribute(symbolId)}"/></svg>`;
}

async function fetchRawSVG(style: string, icon: string): Promise<string | null> {
    const cacheKey = `${style}/${icon}`;
    const existing = rawSvgPromises.get(cacheKey);
    if (existing) {
        return existing;
    }

    const request = fetch(getIconAssetURL(style, icon), {
        cache: 'force-cache',
    })
        .then(async (response) => {
            if (!response.ok) {
                return null;
            }

            return response.text();
        })
        .catch(() => null);

    rawSvgPromises.set(cacheKey, request);
    return request;
}

/**
 * Resolve one icon entry from the raw SVG source and serialize it for sprite injection or
 * same-origin lazy loading.
 */
export async function getIconSymbol(style: string, icon: string, symbolId: string) {
    const rawSVG = await fetchRawSVG(style, icon);
    if (!rawSVG) {
        return null;
    }

    const source = parseRawSVG(rawSVG);
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
