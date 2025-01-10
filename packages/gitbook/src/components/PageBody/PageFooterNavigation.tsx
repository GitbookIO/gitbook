import {
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import { Icon, IconName } from '@gitbook/icons';
import { headers } from 'next/headers';
import React from 'react';

import { t, getSpaceLanguage } from '@/intl/server';
import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getPageHref } from '@/lib/links';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

import { Link, LinkInsightsProps } from '../primitives';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export async function PageFooterNavigation(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
    pages: Revision['pages'];
    page: RevisionPageDocument;
}) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { customization, pages, page } = props;
    const { previous, next } = resolvePrevNextPages(pages, page);
    const language = getSpaceLanguage(customization);
    const previousHref = previous ? getPageHref(ctx, pages, previous) : '';
    const nextHref = next ? getPageHref(ctx, pages, next) : '';

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
                    icon="chevron-left"
                    label={t(language, 'previous_page')}
                    title={previous.title}
                    href={previousHref}
                    insights={{
                        target: {
                            kind: 'page',
                            page: previous.id,
                        },
                        position: 'content',
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
                        target: {
                            kind: 'page',
                            page: next.id,
                        },
                        position: 'content',
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
    } & LinkInsightsProps,
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
                'border-dark/3',
                'rounded',
                'straight-corners:rounded-none',
                'hover:border-primary/6',
                'dark:border-light/2',
                'text-pretty',
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
            <Icon
                icon={icon}
                className={tcls(
                    'hidden',
                    'size-4',
                    'text-dark/5',
                    'group-hover:text-primary',
                    'dark:text-light/4',
                    'md:block',
                )}
            />
        </Link>
    );
}
