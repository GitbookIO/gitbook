import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';

import { IconArrowLeft } from '@/components/icons/IconArrowLeft';
import { IconArrowRight } from '@/components/icons/IconArrowRight';
import { t } from '@/lib/intl';
import { pageHref } from '@/lib/links';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export function PageFooterNavigation(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
}) {
    const { space, revision, page } = props;
    const { previous, next } = resolvePrevNextPages(revision, page);

    return (
        <div className={tcls('flex', 'flex-row', 'mt-6', 'gap-2', 'max-w-3xl', 'mx-auto')}>
            {previous ? (
                <NavigationCard
                    icon={IconArrowLeft}
                    label={t({ space }, 'previous_page')}
                    title={previous.title}
                    href={pageHref(previous)}
                    reversed
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon={IconArrowRight}
                    label={t({ space }, 'next_page')}
                    title={next.title}
                    href={pageHref(next)}
                />
            ) : null}
        </div>
    );
}

function NavigationCard(props: {
    icon: React.ComponentType<{ className: string }>;
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
                    'w-6',
                    'h-6',
                    'text-dark/5',
                    'group-hover:text-primary',
                    'dark:text-light/4',
                )}
            />
        </Link>
    );
}
