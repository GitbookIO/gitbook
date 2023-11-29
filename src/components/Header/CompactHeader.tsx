import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { t } from '@/lib/intl';
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
        <div
            className={tcls(
                'flex',
                'lg:flex-col',
                'flex-wrap',
                'gap-x-5',
                'gap-y-3',
                'justify-between',
            )}
        >
            <div className={tcls('flex-grow-0')}>
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
            <div className={tcls('flex-shrink-0', 'sm:grow', 'sm:max-w-xs', 'lg:max-w-full')}>
                <React.Suspense fallback={null}>
                    <SearchButton style={[]}>
                        <span>{t({ space }, 'search')}</span>
                    </SearchButton>
                </React.Suspense>
            </div>
        </div>
    );
}
