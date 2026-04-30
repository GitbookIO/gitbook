'use client';

import * as React from 'react';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const pendingSymbolLoads = new Map<string, Promise<boolean>>();

/**
 * Ensure a symbol referenced by an inline `<use>` exists after hydration, fetching it from the
 * same-origin symbol route only when the SSR sprite did not already include it.
 */
export function IconSymbolLoader(props: {
    instanceId: string;
    symbolId: string;
    style: string;
    icon: string;
    loaderURL: string;
}) {
    const { instanceId, symbolId, style, icon, loaderURL } = props;

    React.useEffect(() => {
        let mounted = true;

        if (hasSymbol(symbolId)) {
            setIconState(instanceId, true);
            return;
        }

        loadSymbol(symbolId, loaderURL, style, icon).then((loaded) => {
            if (!mounted) {
                return;
            }

            setIconState(instanceId, loaded);
        });

        return () => {
            mounted = false;
        };
    }, [icon, instanceId, loaderURL, style, symbolId]);

    return null;
}

/**
 * A root SVG element used to host the loaded symbols as a spritesheet. This is used as a reference point for the `<use>` elements in the icons.
 */
function getSpriteRoot(): SVGSVGElement {
    const existing = document.getElementById('gb-icon-sprite-root');
    if (existing instanceof SVGSVGElement) {
        return existing;
    }

    return createSpriteRoot();
}

/**
 * Creates the root SVG element for the spritesheet if it doesn't already exist, and appends it to the document body.
 */
function createSpriteRoot(): SVGSVGElement {
    const spriteRoot = document.createElementNS(SVG_NAMESPACE, 'svg');
    spriteRoot.setAttribute('id', 'gb-icon-sprite-root');
    spriteRoot.setAttribute('aria-hidden', 'true');
    spriteRoot.setAttribute('focusable', 'false');
    spriteRoot.setAttribute(
        'style',
        'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
    );
    document.body.prepend(spriteRoot);

    return spriteRoot;
}

function hasSymbol(symbolId: string): boolean {
    return document.getElementById(symbolId) instanceof SVGElement;
}

function buildSymbolURL(loaderURL: string, style: string, icon: string): string {
    const normalizedLoaderURL = loaderURL.endsWith('/') ? loaderURL.slice(0, -1) : loaderURL;

    return `${normalizedLoaderURL}/${encodeURIComponent(style)}/${encodeURIComponent(icon)}`;
}

function appendSymbolsFromDocument(markup: string): boolean {
    const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const symbols = Array.from(parsed.querySelectorAll('symbol'));
    if (symbols.length === 0) {
        return false;
    }

    const spriteRoot = getSpriteRoot();
    for (const symbol of symbols) {
        const symbolId = symbol.getAttribute('id');
        if (!symbolId || hasSymbol(symbolId)) {
            continue;
        }

        spriteRoot.appendChild(document.importNode(symbol, true));
    }

    return true;
}

async function loadSymbol(symbolId: string, loaderURL: string, style: string, icon: string) {
    if (hasSymbol(symbolId)) {
        return true;
    }

    const cached = pendingSymbolLoads.get(symbolId);
    if (cached) {
        return cached;
    }

    const request = fetch(buildSymbolURL(loaderURL, style, icon), {
        credentials: 'same-origin',
    })
        .then(async (response) => {
            if (!response.ok) {
                return false;
            }

            const symbolMarkup = await response.text();
            if (hasSymbol(symbolId)) {
                return true;
            }

            if (!appendSymbolsFromDocument(symbolMarkup)) {
                return false;
            }

            return hasSymbol(symbolId);
        })
        .catch(() => false)
        .finally(() => {
            pendingSymbolLoads.delete(symbolId);
        });

    pendingSymbolLoads.set(symbolId, request);
    return request;
}

function setIconState(instanceId: string, loaded: boolean) {
    const icon = document.querySelector<SVGSVGElement>(
        `svg[data-gb-icon-instance="${instanceId}"]`
    );
    if (!icon) {
        return;
    }

    const symbolUse = icon.querySelector<SVGUseElement>('[data-testid="symbol-use"]');
    if (symbolUse) {
        symbolUse.style.display = loaded ? '' : 'none';
    }
    icon.setAttribute('data-gb-icon-symbol-state', loaded ? 'loaded' : 'failed');
}
