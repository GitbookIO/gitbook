'use client';

import * as React from 'react';

import { type InlineIconSource, getIconSpriteId } from './IconSources';
import { IconStyle } from './types';
import { GITBOOK_ICONS_ASSET_VERSION } from './version';

export interface IconsAssetsLocation {
    /** Rroot url where the icon assets are served */
    assetsURL: string;
    /** Token to be passed in the URL for assets */
    assetsURLToken?: string;
}

export type IconsContextType = Partial<IconsAssetsLocation> & {
    /** Assets location for special styles */
    assetsByStyles?: Record<string, IconsAssetsLocation>;
    /** Server-resolved SVG sources keyed by style and icon. */
    iconSources?: Record<string, InlineIconSource>;
    /** Source keys defined in an on-page sprite, which icons reference instead of repeating the markup. */
    spriteKeys?: ReadonlySet<string>;
    /** Current default style for icons */
    iconStyle: IconStyle;
};

const IconsContext = React.createContext<IconsContextType>({
    iconStyle: IconStyle.Regular,
});

/**
 * Provider to control the loading of icons.
 */
export function IconsProvider(
    props: React.PropsWithChildren<
        Partial<Omit<IconsContextType, 'spriteKeys'>> & {
            /**
             * Define this provider's own `iconSources` once in a hidden sprite, so icons below
             * reference them rather than each repeating the SVG markup.
             */
            sprite?: boolean;
        }
    >
) {
    const parent = React.useContext(IconsContext);
    const {
        children,
        assetsURL = parent.assetsURL,
        assetsURLToken = parent.assetsURLToken,
        iconStyle = parent.iconStyle,
        assetsByStyles = parent.assetsByStyles,
        iconSources = parent.iconSources,
        sprite = false,
    } = props;
    const spriteSources = sprite ? props.iconSources : undefined;
    const value = React.useMemo(() => {
        return {
            assetsURL,
            assetsURLToken,
            iconStyle,
            assetsByStyles,
            iconSources:
                parent.iconSources && iconSources
                    ? { ...parent.iconSources, ...iconSources }
                    : (iconSources ?? parent.iconSources),
            spriteKeys: spriteSources
                ? new Set([...(parent.spriteKeys ?? []), ...Object.keys(spriteSources)])
                : parent.spriteKeys,
        };
    }, [
        assetsURL,
        assetsURLToken,
        iconStyle,
        assetsByStyles,
        iconSources,
        spriteSources,
        parent.iconSources,
        parent.spriteKeys,
    ]);

    return (
        <IconsContext.Provider value={value}>
            {spriteSources ? <IconSprite sources={spriteSources} /> : null}
            {children}
        </IconsContext.Provider>
    );
}

/**
 * Hidden SVG holding one copy of each source, for `<use>` references from icons.
 * Entries are groups rather than symbols so they draw in the referencing icon's own viewBox.
 */
function IconSprite(props: { sources: Record<string, InlineIconSource> }) {
    return (
        <svg
            aria-hidden="true"
            data-gb-icon-sprite=""
            width="0"
            height="0"
            style={{ position: 'absolute' }}
        >
            <defs>
                {Object.entries(props.sources).map(([key, source]) => (
                    <g
                        key={key}
                        id={getIconSpriteId(key)}
                        dangerouslySetInnerHTML={{ __html: source.markup }}
                    />
                ))}
            </defs>
        </svg>
    );
}

/**
 * Hook to access the current icons context.
 */
export function useIcons(): IconsContextType {
    return React.useContext(IconsContext);
}

/**
 * Get the URL for an asset.
 */
export function getAssetURL(location: Partial<IconsAssetsLocation>, path: string): string {
    if (!location.assetsURL) {
        throw new Error('You first need to pass a assetsURL to <IconsProvider>');
    }
    const rawUrl = `${location.assetsURL + (location.assetsURL.endsWith('/') ? '' : '/') + path}?v=${GITBOOK_ICONS_ASSET_VERSION}`;

    if (location.assetsURLToken) {
        const url = new URL(rawUrl);
        url.searchParams.set('token', location.assetsURLToken);
        return url.toString();
    }
    return rawUrl;
}

/**
 * Get the URL for the SVG of an icon.
 */
export function getIconAssetURL(context: IconsContextType, style: string, icon: string): string {
    const location = context.assetsByStyles?.[style] ?? context;
    // Ensure icon is always a string to prevent [object Object]
    const iconName = typeof icon === 'string' ? icon : String(icon);
    return getAssetURL(location, `svgs/${style}/${iconName}.svg`);
}
