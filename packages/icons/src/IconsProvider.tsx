'use client';

import * as React from 'react';
import { IconStyle } from './types';

export interface IconsContextType {
    /** Root url where the icon assets are served */
    assetsURL?: string;
    /** Token to be passed in the URL for assets */
    assetsURLToken?: string;
    /** Current default style for icons */
    iconStyle: IconStyle;
}

const IconsContext = React.createContext<IconsContextType>({
    iconStyle: IconStyle.Regular,
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
    } = props;
    const value = React.useMemo(() => {
        return { assetsURL, assetsURLToken, iconStyle };
    }, [assetsURL, assetsURLToken, iconStyle]);
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
export function getAssetURL(context: IconsContextType, path: string): string {
    if (!context.assetsURL) {
        throw new Error('You first need to pass a assetsURL to <IconsProvider>');
    }
    const url = new URL(context.assetsURL + (context.assetsURL.endsWith('/') ? '' : '/') + path);
    if (context.assetsURLToken) {
        url.searchParams.set('token', context.assetsURLToken);
    }
    return url.toString();
}
