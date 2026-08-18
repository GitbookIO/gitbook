import { type RevisionPageDocument, SiteInsightsLinkPosition } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import type React from 'react';

import { getSpaceLanguage, t } from '@/intl/server';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

import type { GitBookSiteContext } from '@/lib/context';
import { CONTENT_STYLE } from '../layout';
import { Link, type LinkInsightsProps } from '../primitives';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export async function PageFooterNavigation(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
}) {
    const { context, page } = props;
    const { revision, linker } = context;
    const { previous, next } = resolvePrevNextPages(revision.pages, page);
    const language = await getSpaceLanguage(context);
    const previousHref = previous
        ? linker.toPathForPage({ pages: revision.pages, page: previous })
        : '';
    const nextHref = next ? linker.toPathForPage({ pages: revision.pages, page: next }) : '';

    return (
        <div className={tcls(CONTENT_STYLE, 'mt-6 flex @xl:flex-row flex-col gap-3 text-tint')}>
            {previous ? (
                <NavigationCard
                    icon="chevron-left"
                    label={t(language, 'previous_page')}
                    title={previous.linkTitle || previous.title}
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
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon="chevron-right"
                    label={t(language, 'next_page')}
                    title={next.linkTitle || next.title}
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
                    reversed
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
                'group flex flex-1 items-center @xl:gap-3 gap-2 text-pretty circular-corners:rounded-2xl rounded-corners:rounded-xl border border-tint-subtle @xl:p-4 p-3 @xl:text-base text-sm text-tint outline-tint-12 transition-colors hover:border-primary-hover contrast-more:border-tint-12 contrast-more:text-tint-strong contrast-more:hover:border-primary-12 contrast-more:hover:outline-2',
                reversed ? 'flex-row-reverse text-end' : 'text-start'
            )}
        >
            <Icon icon={icon} className="size-3" />
            <div className="flex flex-col">
                <span
                    className={tcls(
                        'flex items-center gap-1 text-xs',
                        reversed ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    {label}
                </span>
                <span className="line-clamp-2 text-tint-strong leading-snug transition-colors group-hover:text-primary contrast-more:group-hover:text-primary-strong">
                    {title}
                </span>
            </div>
        </Link>
    );
}
