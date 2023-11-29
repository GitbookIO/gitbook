import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import Link from 'next/link';

import { pageHref } from '@/lib/links';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export function PageDocumentItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageDocument;
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const { rootPages, page, activePage, ancestors, context } = props;

    const hasActiveDescendant = ancestors.some((ancestor) => ancestor.id === page.id);

    const linkProps = {
        href: pageHref(rootPages, page),
        className: tcls(
            'flex',
            'flex-row',
            'justify-between',
            'rounded',
            'px-2',
            'py-1.5',
            'text-sm',
            'transition-colors',
            'duration-100',
            activePage.id === page.id
                ? [
                      'font-semibold',
                      'text-primary',
                      'bg-primary-500/3',
                      'dark:text-primary-400',
                      'dark:hover:bg-primary-500/5',
                  ]
                : [
                      'font-normal',
                      'text-dark/7',
                      'hover:bg-dark/1',
                      'dark:text-light/7',
                      'dark:hover:bg-light/2',
                  ],
        ),
    };

    return (
        <li className={tcls('flex', 'flex-col', 'mb-0.5')}>
            {page.pages && page.pages.length ? (
                <ToggleableLinkItem
                    {...linkProps}
                    descendants={
                        <PagesList
                            rootPages={rootPages}
                            pages={page.pages}
                            style={tcls(
                                'ms-2',
                                'ps-3',
                                'my-2',
                                'border-l',
                                'border-dark/3',
                                'dark:border-light/2',
                            )}
                            activePage={activePage}
                            ancestors={ancestors}
                            context={context}
                        />
                    }
                    defaultOpen={hasActiveDescendant || activePage.id === page.id}
                    isActive={activePage.id === page.id}
                >
                    {page.title}
                </ToggleableLinkItem>
            ) : (
                <Link {...linkProps}>{page.title}</Link>
            )}
        </li>
    );
}
