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
            'pl-5',
            'pr-1.5',
            'py-1.5',
            'text-sm',
            'transition-colors',
            'relative',
            'textwrap-balance',
            'before:border-l',
            'before:absolute',
            'before:left-[-1px]',
            'before:top-0',
            'before:h-full',
            'rounded-md',
            '[&+div_a]:rounded-l-none',
            activePage.id === page.id
                ? [
                      'before:border-primary/6',
                      'font-semibold',
                      'text-primary',
                      'hover:bg-primary/3',
                      'dark:text-primary-400',
                      'hover:before:border-primary',
                      'dark:hover:bg-primary-500/3',
                      'dark:hover:before:border-primary',
                  ]
                : [
                      'before:border-transparent',
                      'font-normal',
                      'text-dark/8',
                      'hover:bg-dark/1',
                      'hover:before:border-dark/3',
                      'dark:text-light/7',
                      'dark:hover:bg-light/2',
                      'dark:hover:before:border-light/3',
                  ],
        ),
    };

    return (
        <li className={tcls('flex', 'flex-col')}>
            {page.pages && page.pages.length ? (
                <ToggleableLinkItem
                    {...linkProps}
                    descendants={
                        <PagesList
                            rootPages={rootPages}
                            pages={page.pages}
                            style={tcls(
                                'ms-5',
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
