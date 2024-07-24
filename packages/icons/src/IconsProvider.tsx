'use client';

import * as React from 'react';
import { setAssetsURL } from './assets';

/**
 * Provider to control the loading of icons.
 */
export function IconsProvider(
    props: React.PropsWithChildren<{
        /** Root url where the icon assets are served */
        assetsURL: string;
    }>,
) {
    const { children, assetsURL } = props;
    setAssetsURL(assetsURL);

    return <>{children}</>;
}
