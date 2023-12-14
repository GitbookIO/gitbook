import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import { CustomizationHeaderPreset } from '@gitbook/api';
import { Suspense } from 'react';

import {
    CONTAINER_MAX_WIDTH_NORMAL,
    CONTAINER_PADDING,
    HEADER_HEIGHT_DESKTOP,
} from '@/components/layout';
import { t, getSpaceLanguage } from '@/intl/server';
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
                `h-[${HEADER_HEIGHT_DESKTOP}px]`,
                'sticky',
                'top-0',
                'z-10',
                'w-full',
                'backdrop-blur-lg',
                'flex-none',
                'transition-colors',
                'duration-500',
                'shadow-thinbottom',
                'lg:z-10',
                'supports-backdrop-blur:bg-white/60',
                'dark:shadow-light/2',
                `${isCustomizationDefault ? 'bg-light/9' : 'bg-header-background/9'}`,
                `${isCustomizationDefault ? 'dark:bg-dark/9' : 'bg-header-background/9'}`,
            )}
        >
            <div
                className={tcls(
                    'gap-8',
                    'grid',
                    'grid-flow-col',
                    'auto-cols-[auto_auto_1fr_auto]',
                    'h-16',
                    'items-center',
                    'align-center',
                    'justify-between',
                    'w-full',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <HeaderLogo collection={collection} space={space} customization={customization} />
                <span>
                    {collection ? (
                        <CollectionSpacesDropdown
                            space={space}
                            collection={collection}
                            collectionSpaces={collectionSpaces}
                        />
                    ) : null}
                </span>
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
                            <span>{t(getSpaceLanguage(customization), 'search')}</span>
                        </SearchButton>
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
