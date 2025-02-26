import { type RevisionPageDocument, SiteInsightsLinkPosition } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import type React from 'react';

import { getSpaceLanguage, t } from '@/intl/server';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

import type { GitBookSiteContext } from '@v2/lib/context';
import { Link, type LinkInsightsProps } from '../primitives';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export async function PageFooterNavigation(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
}) {
    const { context, page } = props;
    const { customization, pages, linker } = context;
    const { previous, next } = resolvePrevNextPages(pages, page);
    const language = getSpaceLanguage(customization);
    const previousHref = previous ? linker.toPathForPage({ pages, page: previous }) : '';
    const nextHref = next ? linker.toPathForPage({ pages, page: next }) : '';

    return (
        <div
            className={tcls(
                'flex',
                'flex-col',
                'md:flex-row',
                'mt-6',
                'gap-2',
                'max-w-3xl',
                'mx-auto',
                'page-api-block:ml-0',
                'text-tint'
            )}
        >
            {previous ? (
                <NavigationCard
                    icon="chevron-left"
                    label={t(language, 'previous_page')}
                    title={previous.title}
                    href={previousHref}
                    insights={{
                        type: 'link_click',
                        link: {
                            target: {
                                kind: 'page',
                                page: previous.id,
                            },
                            position: SiteInsightsLinkPosition.Content,
                        },
                    }}
                    reversed
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon="chevron-right"
                    label={t(language, 'next_page')}
                    title={next.title}
                    href={nextHref}
                    insights={{
                        type: 'link_click',
                        link: {
                            target: {
                                kind: 'page',
                                page: next.id,
                            },
                            position: SiteInsightsLinkPosition.Content,
                        },
                    }}
                />
            ) : null}
        </div>
    );
}

function NavigationCard(
    props: {
        icon: IconName;
        label: React.ReactNode;
        title: string;
        href: string;
        reversed?: boolean;
    } & LinkInsightsProps
) {
    const { icon, label, title, href, reversed, insights } = props;

    return (
        <Link
            href={href}
            insights={insights}
            className={tcls(
                'group',
                'text-sm',
                'p-2.5',
                'flex',
                'gap-4 ',
                'flex-1',
                reversed ? 'flex-row-reverse' : 'flex-row',
                'items-center',
                reversed ? null : 'pr-4',
                reversed ? 'pl-4' : null,
                'border',
                'border-tint-subtle',
                'rounded',
                'straight-corners:rounded-none',
                'hover:border-primary',
                'text-pretty',
                'md:p-4',
                'md:text-base'
            )}
        >
            <span className={tcls('flex', 'flex-col', 'flex-1', reversed ? 'text-right' : null)}>
                <span className={tcls('text-xs')}>{label}</span>
                <span
                    className={tcls('text-tint-strong', 'group-hover:text-primary', 'line-clamp-2')}
                >
                    {title}
                </span>
            </span>
            <Icon
                icon={icon}
                className={tcls(
                    'hidden',
                    'size-4',
                    'text-tint-subtle',
                    'contrast-more:text-tint-strong',
                    'group-hover:text-primary',
                    'md:block'
                )}
            />
        </Link>
    );
}
