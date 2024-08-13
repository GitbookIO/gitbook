import {
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import React from 'react';

import { ContentPointer } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { Trademark } from './Trademark';
import { TOCScrollContainerProvider } from './useScrollToActiveTOCItem';

export function TableOfContents(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
    content: ContentPointer;
    context: ContentRefContext;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    header?: React.ReactNode;
    withHeaderOffset: boolean;
}) {
    const { space, customization, pages, ancestors, header, context, withHeaderOffset } = props;

    return (
        <aside
            className={tcls(
                'relative',
                'group',
                'flex',
                'flex-col',
                'basis-full',
                'bg-light',
                'grow-0',
                'shrink-0',
                'shadow-transparent',
                'shadow-thinbottom',
                'navigation-open:shadow-dark/2',
                'z-[1]',
                'top-0',
                `h-[100vh]`,
                'lg:basis-72',
                'lg:navigation-open:border-b-0',
                'lg:sticky',
                'dark:bg-dark',
                'dark:navigation-open:shadow-light/2',
                withHeaderOffset ? 'lg:h-[calc(100vh_-_4rem)]' : 'lg:h-[100vh]',
                withHeaderOffset ? 'lg:top-16' : 'lg:top-0',
                'page-no-toc:lg:hidden',
            )}
        >
            {header ? header : null}
            <TOCScrollContainerProvider
                withHeaderOffset={withHeaderOffset}
                withTrademarkEnabled={customization.trademark.enabled}
            >
                <PagesList
                    rootPages={pages}
                    pages={pages}
                    ancestors={ancestors}
                    context={context}
                />
                {customization.trademark.enabled ? (
                    <Trademark space={space} customization={customization} />
                ) : null}
            </TOCScrollContainerProvider>
        </aside>
    );
}
