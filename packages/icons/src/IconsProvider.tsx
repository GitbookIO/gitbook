'use client';

import * as React from 'react';
import type { IconRenderMode } from './symbols';
import { IconStyle } from './types';

const version = 2;

export interface IconsAssetsLocation {
    /** Rroot url where the icon assets are served */
    assetsURL: string;
    /** Token to be passed in the URL for assets */
    assetsURLToken?: string;
}

export type IconsContextType = Partial<IconsAssetsLocation> & {
    /** Assets location for special styles */
    assetsByStyles?: Record<string, IconsAssetsLocation>;
    /** Current default style for icons */
    iconStyle: IconStyle;
    /** Rendering strategy for icons */
    renderMode: IconRenderMode;
    /** Base URL used to lazily load prebuilt symbol documents introduced after hydration */
    symbolLoaderURL?: string;
};

const IconsContext = React.createContext<IconsContextType>({
    iconStyle: IconStyle.Regular,
    renderMode: 'mask',
});

/**
 * Provider to control the loading of icons.
 */
export function IconsProvider(props: React.PropsWithChildren<Partial<IconsContextType>>) {
    const parent = React.useContext(IconsContext);
    const {
        children,
        assetsURL = parent.assetsURL,
        assetsURLToken = parent.assetsURLToken,
        iconStyle = parent.iconStyle,
        assetsByStyles = parent.assetsByStyles,
        renderMode = parent.renderMode,
        symbolLoaderURL = parent.symbolLoaderURL,
    } = props;
    const value = {
        assetsURL,
        assetsURLToken,
        iconStyle,
        assetsByStyles,
        renderMode,
        symbolLoaderURL,
    };

    return <IconsContext.Provider value={value}>{children}</IconsContext.Provider>;
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
    const rawUrl = `${location.assetsURL + (location.assetsURL.endsWith('/') ? '' : '/') + path}?v=${version}`;

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

/**
 * Get the URL for the sprite document of an icon style.
 */
export function getIconSpriteAssetURL(context: IconsContextType, style: string): string {
    const location = context.assetsByStyles?.[style] ?? context;
    return getAssetURL(location, `sprites/${style}.svg`);
}
