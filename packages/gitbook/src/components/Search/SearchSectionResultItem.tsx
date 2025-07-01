import React from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResults';
import type { ComputedSectionResult } from './server-actions';

export const SearchSectionResultItem = React.forwardRef(function SearchSectionResultItem(
    props: {
        query: string;
        item: ComputedSectionResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active } = props;
    const language = useLanguage();

    return (
        <SearchResultItem
            ref={ref}
            href={item.href}
            size="small"
            active={active}
            action={tString(language, 'view')}
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
        >
            <div className="grow border-tint-subtle border-l-2 pl-4">
                {item.title ? (
                    <h5 className="font-medium">
                        <HighlightQuery query={query} text={item.title} />
                    </h5>
                ) : null}
                {item.body ? highlightQueryInBody(item.body, query) : null}
            </div>
        </SearchResultItem>
        // <Link
        //     ref={ref}
        //     href={item.href}
        //     className={tcls(
        //         '[&:has(+:not(&))]:mb-6',
        //         'flex',
        //         'items-center',
        //         'pl-6',
        //         'sm:pl-12',
        //         'pr-4',
        //         'text-tint',
        //         'hover:bg-tint-hover',
        //         'font-normal',
        //         'py-2',
        //         'group',
        //         active && [
        //             'is-active',
        //             'bg-primary',
        //             'text-contrast-primary',
        //             'hover:bg-primary-hover',
        //         ]
        //     )}
        //     insights={{
        //         type: 'search_open_result',
        //         query,
        //         result: {
        //             pageId: item.pageId,
        //             spaceId: item.spaceId,
        //         },
        //     }}
        // >
        //     <div
        //         className={tcls(
        //             'border-l-2',
        //             'px-4',
        //             'py-1',
        //             'flex',
        //             'flex-1',
        //             'overflow-hidden',
        //             'flex-col',
        //             'border-tint-subtle'
        //         )}
        //     >
        //         {item.title ? (
        //             <p className={tcls('text-base', 'mb-2')}>
        //                 <HighlightQuery query={query} text={item.title} />
        //             </p>
        //         ) : null}
        //         {item.body ? highlightQueryInBody(item.body, query) : null}
        //     </div>
        //     <div
        //         className={tcls(
        //             'p-2',
        //             'rounded',
        //             'straight-corners:rounded-none',
        //             'circular-corners:rounded-full',
        //             'bg-primary-solid',
        //             'text-contrast-primary-solid',
        //             'hidden',
        //             'sm:block',
        //             active ? ['opacity-11', 'block'] : ['opacity-0']
        //         )}
        //     >
        //         <Icon icon="arrow-turn-down-left" className={tcls('size-4')} />
        //     </div>
        // </Link>
    );
});

function highlightQueryInBody(body: string, query: string) {
    const idx = body.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());

    // Ensure the query to be highlighted is visible in the body.
    return (
        <p className={tcls('text-sm', 'line-clamp-3', 'relative')}>
            <HighlightQuery query={query} text={idx < 20 ? body : `...${body.slice(idx - 10)}`} />
        </p>
    );
}
