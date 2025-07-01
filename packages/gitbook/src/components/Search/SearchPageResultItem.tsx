import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResults';
import type { ComputedPageResult } from './server-actions';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active } = props;
    const language = useLanguage();

    const breadcrumbs =
        item.breadcrumbs?.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
                {crumb.icon ? <Icon className="size-3" icon={crumb.icon as IconName} /> : null}
                {crumb.label}
            </span>
        )) ?? [];

    return (
        <SearchResultItem
            ref={ref}
            href={item.href}
            active={active}
            action={tString(language, 'view')}
            leadingIcon={<Icon icon="memo" className="size-4" />}
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
        >
            {breadcrumbs.length > 0 ? (
                <div
                    className={tcls(
                        'text-xs',
                        'text-tint/7',
                        'contrast-more:text-tint',
                        'group-[.is-active]:text-tint',
                        'transition-colors',
                        'font-normal',
                        'uppercase',
                        'tracking-wider',
                        'mb-1',
                        'flex',
                        'flex-wrap',
                        'gap-x-2',
                        'gap-y-1',
                        'items-center'
                    )}
                >
                    {(breadcrumbs.length > 3
                        ? [
                              ...breadcrumbs.slice(0, 2),
                              <Icon key="ellipsis" icon="ellipsis-h" className="size-3" />,
                              ...breadcrumbs.slice(-1),
                          ]
                        : breadcrumbs
                    ).map((crumb, index) => (
                        <React.Fragment key={crumb.key}>
                            {index !== 0 ? (
                                <Icon
                                    key={`${crumb.key}-icon`}
                                    icon="chevron-right"
                                    className="size-2"
                                />
                            ) : null}
                            <span className="line-clamp-1">{crumb}</span>
                        </React.Fragment>
                    ))}
                </div>
            ) : null}
            <p className="line-clamp-2 font-medium text-base text-tint-strong">
                <HighlightQuery query={query} text={item.title} />
            </p>
        </SearchResultItem>
        // <Link
        //     ref={ref}
        //     href={item.href}
        //     className={tcls(
        //         'flex',
        //         'items-center',
        //         'gap-3',
        //         'group',
        //         'px-4',
        //         'py-3',
        //         'text-base',
        //         'font-medium',
        //         'hover:bg-tint-hover',
        //         'group',
        //         active
        //             ? ['is-active', 'bg-primary', 'text-contrast-primary', 'hover:bg-primary-hover']
        //             : null
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
        //     <div className="size-4">
        //         <Icon
        //             icon="file-lines"
        //             className={tcls('size-4', active ? 'text-primary' : 'text-tint-subtle')}
        //         />
        //     </div>
        //     <div className={tcls('flex', 'flex-col', 'w-full')}>
        //         {breadcrumbs.length > 0 ? (
        //             <div
        //                 className={tcls(
        //                     'text-xs',
        //                     'opacity-6',
        //                     'contrast-more:opacity-11',
        //                     'font-normal',
        //                     'uppercase',
        //                     'tracking-wider',
        //                     'mb-1',
        //                     'flex',
        //                     'flex-wrap',
        //                     'gap-x-2',
        //                     'gap-y-1',
        //                     'items-center'
        //                 )}
        //             >
        //                 {(breadcrumbs.length > 3
        //                     ? [
        //                           ...breadcrumbs.slice(0, 2),
        //                           <Icon key="ellipsis" icon="ellipsis-h" className="size-3" />,
        //                           ...breadcrumbs.slice(-1),
        //                       ]
        //                     : breadcrumbs
        //                 ).map((crumb, index) => (
        //                     <div key={crumb.key}>
        //                         {index !== 0 ? (
        //                             <Icon
        //                                 key={`${crumb.key}-icon`}
        //                                 icon="chevron-right"
        //                                 className="size-3"
        //                             />
        //                         ) : null}
        //                         <span className="line-clamp-1">{crumb}</span>
        //                     </div>
        //                 ))}
        //             </div>
        //         ) : null}
        //         <HighlightQuery query={query} text={item.title} />
        //     </div>
        //     <div
        //         className={tcls(
        //             'p-2',
        //             'rounded',
        //             'straight-corners:rounded-none',
        //             'circular-corners:rounded-full',
        //             active ? ['bg-primary-solid', 'text-contrast-primary-solid'] : ['opacity-6']
        //         )}
        //     >
        //         <Icon
        //             icon={active ? 'arrow-turn-down-left' : 'chevron-right'}
        //             className={tcls('size-4')}
        //         />
        //     </div>
        // </Link>
    );
});
