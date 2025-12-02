import type { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import type { GitBookSpaceContext } from '@/lib/context';
import { Link } from '../primitives';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: {
    context: GitBookSpaceContext;
    placement: SiteInsightsTrademarkPlacement;
}) {
    return (
        <div
            className={tcls(
                'sticky',
                'z-2',

                'inset-x-0',
                '-bottom-2',
                '-mb-2',

                'pointer-events-none',

                'bg-tint-base',
                'sidebar-filled:bg-tint-subtle',
                'theme-muted:bg-tint-subtle',
                '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',

                'rounded-lg',
                'straight-corners:rounded-none',
                'circular-corners:rounded-2xl'
            )}
        >
            <TrademarkLink {...props} />
        </div>
    );
}

/**
 * Trademark link to the GitBook.
 */
export function TrademarkLink(props: {
    context: GitBookSpaceContext;
    placement: SiteInsightsTrademarkPlacement;
}) {
    const { context, placement } = props;
    const { space } = context;
    const language = getSpaceLanguage(context);

    const url = new URL('https://www.gitbook.com');
    url.searchParams.set('utm_source', 'content');
    url.searchParams.set('utm_medium', 'trademark');
    url.searchParams.set('utm_campaign', space.id);

    return (
        <Link
            target="_blank"
            href={url.toString()}
            className={tcls(
                'text-sm',
                // 'lg:max-xl:page-no-toc:text-xs',
                // 'lg:max-xl:page-no-toc:px-3',
                // 'lg:max-xl:page-no-toc:py-3',
                'font-semibold',
                'text-tint',

                'flex',
                'flex-row',
                'items-center',
                'px-5',
                'py-4',

                'sidebar-filled:px-3',
                'lg:sidebar-filled:page-no-toc:px-5',

                'rounded-lg',
                'straight-corners:rounded-none',
                'circular-corners:rounded-2xl',

                'hover:bg-tint',
                'hover:text-tint-strong',

                'ring-2',
                'lg:ring-1',
                'ring-inset',
                'ring-tint-subtle',

                'transition-colors',
                'pointer-events-auto'
            )}
            insights={{
                type: 'trademark_click',
                placement,
            }}
        >
            <Icon
                icon="gitbook"
                className={tcls(
                    'size-5',
                    // 'lg:max-xl:page-no-toc:size-4',
                    'shrink-0'
                )}
            />
            <span
                className={tcls(
                    'ml-3'
                    // 'lg:max-xl:page-no-toc:ml-2'
                )}
            >
                {t(language, 'powered_by_gitbook')}
            </span>
        </Link>
    );
}
