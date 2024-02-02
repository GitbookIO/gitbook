import ChevronLeft from '@geist-ui/icons/chevronLeft';
import ChevronRight from '@geist-ui/icons/chevronRight';
import { CustomizationSettings, Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';
import React from 'react';

import { t, getSpaceLanguage } from '@/intl/server';
import { pageHref } from '@/lib/links';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export function PageFooterNavigation(props: {
    space: Space;
    customization: CustomizationSettings;
    pages: Revision['pages'];
    page: RevisionPageDocument;
}) {
    const { customization, pages, page } = props;
    const { previous, next } = resolvePrevNextPages(pages, page);
    const language = getSpaceLanguage(customization);

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
            )}
        >
            {previous ? (
                <NavigationCard
                    icon={ChevronLeft}
                    label={t(language, 'previous_page')}
                    title={previous.title}
                    href={pageHref(pages, previous)}
                    reversed
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon={ChevronRight}
                    label={t(language, 'next_page')}
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
                'border-dark/3',
                'rounded',
                'straight-corners:rounded-none',
                'hover:border-primary/6',
                'dark:border-light/2',
                'textwrap-pretty',
                'dark:hover:border-primary-300/4',
                'md:p-4',
                'md:text-base',
            )}
        >
            <span className={tcls('flex', 'flex-col', 'flex-1', reversed ? 'text-right' : null)}>
                <span className={tcls('text-xs')}>{label}</span>
                <span
                    className={tcls(
                        'text-dark',
                        'dark:text-light/6',
                        'group-hover:text-primary',
                        'line-clamp-2',
                    )}
                >
                    {title}
                </span>
            </span>
            <IconCo
                className={tcls(
                    'hidden',
                    'w-5',
                    'h-5',
                    'stroke-dark/5',
                    'group-hover:stroke-primary',
                    'dark:stroke-light/4',
                    'md:block',
                )}
            />
        </Link>
    );
}
