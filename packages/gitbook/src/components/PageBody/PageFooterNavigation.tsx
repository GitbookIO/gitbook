import type React from 'react';

import { type RevisionPageDocument, SiteInsightsLinkPosition } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { Link, type LinkInsightsProps } from '../primitives';
import { getSpaceLanguage, t } from '@/intl/server';
import { cx } from '@/lib/classnames';
import type { GitBookSiteContext } from '@/lib/context';
import { resolvePrevNextPages } from '@/lib/pages';

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
        <div className="page-nav">
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
            className={cx('page-nav-card', reversed && 'page-nav-next')}
        >
            <Icon icon={icon} className="size-3" />
            <div className="page-nav-body">
                <span className="page-nav-label">{label}</span>
                <span className="page-nav-title">{title}</span>
            </div>
        </Link>
    );
}
