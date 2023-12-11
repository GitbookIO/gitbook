import ChevronLeft from '@geist-ui/icons/chevronLeft';
import ChevronRight from '@geist-ui/icons/chevronRight';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';
import React from 'react';

import { t } from '@/lib/intl';
import { pageHref } from '@/lib/links';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export function PageFooterNavigation(props: {
    space: Space;
    pages: Revision['pages'];
    page: RevisionPageDocument;
}) {
    const { space, pages, page } = props;
    const { previous, next } = resolvePrevNextPages(pages, page);

    return (
        <div className={tcls('flex', 'flex-row', 'mt-6', 'gap-2', 'max-w-3xl', 'mx-auto')}>
            {previous ? (
                <NavigationCard
                    icon={ChevronLeft}
                    label={t({ space }, 'previous_page')}
                    title={previous.title}
                    href={pageHref(pages, previous)}
                    reversed
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon={ChevronRight}
                    label={t({ space }, 'next_page')}
                    title={next.title}
                    href={pageHref(pages, next)}
                />
            ) : null}
        </div>
    );
}

function NavigationCard(props: {
    icon: React.FunctionComponent<{ className?: string }>;
    label: React.ReactNode;
    title: string;
    href: string;
    reversed?: boolean;
}) {
    const { icon: IconCo, label, title, href, reversed } = props;

    return (
        <Link
            href={href}
            className={tcls(
                'group',
                'flex',
                'flex-1',
                reversed ? 'flex-row-reverse' : 'flex-row',
                'items-center',
                'p-4',
                'border',
                'border-dark/3',
                'rounded',
                'hover:border-primary/6',
                'dark:border-light/2',
                'dark:hover:border-primary-300/4',
            )}
        >
            <span className={tcls('flex', 'flex-col', 'flex-1', reversed ? 'text-right' : null)}>
                <span className={tcls('text-xs')}>{label}</span>
                <span
                    className={tcls('text-dark', 'dark:text-light/6', 'group-hover:text-primary')}
                >
                    {title}
                </span>
            </span>
            <IconCo
                className={tcls(
                    'w-5',
                    'h-5',
                    'stroke-dark/5',
                    'group-hover:stroke-primary',
                    'dark:stroke-light/4',
                )}
            />
        </Link>
    );
}
