import { pageHref } from '@/lib/links';
import { resolvePrevNextPages } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';
import { IconArrowLeft } from '@/components/icons/IconArrowLeft';
import { IconArrowRight } from '@/components/icons/IconArrowRight';
import { t } from '@/lib/intl';

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
                'border-slate-200',
                'rounded',
                'hover:shadow',
                'hover:border-primary-500',
            )}
        >
            <span className={tcls('flex', 'flex-col', 'flex-1', reversed ? 'text-right' : null)}>
                <span className={tcls('text-xs', 'text-slate-400')}>{label}</span>
                <span
                    className={tcls('text-base', 'text-slate-700', 'group-hover:text-primary-600')}
                >
                    {title}
                </span>
            </span>
            <IconCo
                className={tcls('w-6', 'h-6', 'text-slate-400', 'group-hover:text-primary-600')}
            />
        </Link>
    );
}
