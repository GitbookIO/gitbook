import {
    Collection,
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    Space,
} from '@gitbook/api';
import { Suspense } from 'react';

import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';
import { t } from '@/lib/intl';
import { tcls } from '@/lib/tailwind';

import { CollectionSpacesDropdown } from './CollectionSpacesDropdown';
import { HeaderLink } from './HeaderLink';
import { HeaderLogo } from './HeaderLogo';
import { SearchButton } from '../Search';

/**
 * Render the header for the space.
 */
export function Header(props: {
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    revision: Revision;
    page: RevisionPageDocument;
    asFullWidth: boolean;
    customization: CustomizationSettings;
}) {
    const { space, collection, collectionSpaces, revision, page, asFullWidth, customization } =
        props;

    return (
        <header
            className={tcls(
                'flex',
                'flex-row',
                'h-16',
                'sticky',
                'top-0',
                'z-10',
                'w-full',
                'backdrop-blur',
                'flex-none',
                'transition-colors',
                'duration-500',
                'lg:z-10',
                'lg:border-b',
                'lg:border-slate-900/10',
                'dark:border-slate-50/[0.06]',
                'bg-header-background-500',
                'supports-backdrop-blur:bg-white/60',
                'dark:bg-transparent',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-1',
                    'flex-row',
                    'items-center',
                    'gap-8',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <HeaderLogo
                    collection={collection}
                    space={space}
                    customization={customization}
                    textStyle={[
                        'text-header-link-500',
                        'group-hover/headerlogo:text-header-link-700',
                    ]}
                />
                {collection ? (
                    <CollectionSpacesDropdown
                        space={space}
                        collection={collection}
                        collectionSpaces={collectionSpaces}
                    />
                ) : null}
                <div
                    className={tcls(
                        'flex',
                        'flex-row',
                        'flex-row',
                        'gap-5',
                        'flex-1',
                        'justify-end',
                        'items-center',
                    )}
                >
                    {customization.header.links.map((link, index) => (
                        <HeaderLink
                            key={index}
                            link={link}
                            space={space}
                            revision={revision}
                            page={page}
                        />
                    ))}
                </div>
                <div className={tcls('flex', 'basis-56', 'grow-0', 'shrink-0')}>
                    <Suspense fallback={null}>
                        <SearchButton style={['bg-header-background-300']}>
                            {t({ space }, 'search')}
                        </SearchButton>
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
