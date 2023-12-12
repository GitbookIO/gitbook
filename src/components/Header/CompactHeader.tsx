import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { t } from '@/intl/server';
import { getSpaceLanguage } from '@/intl/server';
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
                'lg:gap-x-5',
                'gap-y-3',
                'justify-between',
            )}
        >
            <div className={tcls('flex-grow-0')}>
                <HeaderLogo collection={collection} space={space} customization={customization} />
            </div>
            <div
                className={tcls(
                    'flex-shrink-0',
                    'grow-0',
                    'md:grow',
                    'sm:max-w-xs',
                    'lg:max-w-full',
                    'justify-self-end',
                )}
            >
                <React.Suspense fallback={null}>
                    <SearchButton>
                        <span>{t(getSpaceLanguage(customization), 'search')}</span>
                    </SearchButton>
                </React.Suspense>
            </div>
        </div>
    );
}
