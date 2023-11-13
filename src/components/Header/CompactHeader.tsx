import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HeaderLogo } from './HeaderLogo';
import { SearchButton } from '../Search';

/**
 * Header to display on top of the table of contents when the space has no header configured.
 */
export function CompactHeader(props: {
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    customization: CustomizationSettings;
}) {
    const { space, collection, customization } = props;

    return (
        <div className={tcls('flex', 'flex-row', 'items-center')}>
            <div className={tcls('flex-1')}>
                <HeaderLogo
                    collection={collection}
                    space={space}
                    customization={customization}
                    textStyle={[
                        'text-header-link-500',
                        'group-hover/headerlogo:text-header-link-700',
                    ]}
                />
            </div>
            <div className={tcls(['ms-2'])}>
                <React.Suspense fallback={null}>
                    <SearchButton />
                </React.Suspense>
            </div>
        </div>
    );
}
