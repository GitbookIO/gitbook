import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import { CustomizationHeaderPreset } from '@gitbook/api';
import { Suspense } from 'react';

import {
    CONTAINER_MAX_WIDTH_NORMAL,
    CONTAINER_PADDING,
    HEADER_HEIGHT_DESKTOP,
} from '@/components/layout';
import { t } from '@/lib/intl';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { CollectionSpacesDropdown } from './CollectionSpacesDropdown';
import { HeaderLink } from './HeaderLink';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { SearchButton } from '../Search';
/**
 * Render the header for the space.
 */
export function Header(props: {
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    context: ContentRefContext;
    asFullWidth: boolean;
    customization: CustomizationSettings;
}) {
    const { context, space, collection, collectionSpaces, asFullWidth, customization } = props;

    const isCustomizationDefault =
        customization.header.preset === CustomizationHeaderPreset.Default;

    return (
        <header
            className={tcls(
                'flex',
                'flex-row',
                HEADER_HEIGHT_DESKTOP,
                'sticky',
                'top-0',
                'z-10',
                'w-full',
                'backdrop-blur-lg',
                'flex-none',
                'transition-colors',
                'duration-500',
                'lg:z-10',
                'lg:border-b',
                'lg:border-dark/3',
                'supports-backdrop-blur:bg-white/60',
                'dark:border-light/2',
                `${isCustomizationDefault ? 'bg-light/9' : 'bg-header-background/9'}`,
                `${isCustomizationDefault ? 'dark:bg-dark/9' : 'bg-header-background/9'}`,
            )}
        >
            <div
                className={tcls(
                    'gap-8',
                    'grid',
                    'grid-cols-[min-content_min-content]',
                    'sm:grid-cols-[min-content_1fr_min-content]',
                    'h-16',
                    'items-center',
                    'align-center',
                    'justify-between',
                    'w-full',
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
                <HeaderLinks>
                    {customization.header.links.map((link, index) => {
                        return (
                            <HeaderLink
                                key={index}
                                link={link}
                                context={context}
                                customization={customization}
                            />
                        );
                    })}
                </HeaderLinks>

                <div className={tcls('flex', 'md:w-56', 'grow-0', 'shrink-0', 'justify-self-end')}>
                    <Suspense fallback={null}>
                        <SearchButton>
                            <span>{t({ space }, 'search')}</span>
                        </SearchButton>
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
