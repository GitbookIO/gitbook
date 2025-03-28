import type {
    SiteCustomizationSettings,
    SiteInsightsTrademarkPlacement,
    Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: {
    space: Space;
    customization: SiteCustomizationSettings;
    placement: SiteInsightsTrademarkPlacement;
}) {
    return (
        <div
            className={tcls(
                'relative',
                'z-[2]',
                'lg:absolute',

                'left-0',
                'right-2',
                'bottom-0',

                'pointer-events-none',
                'sidebar-filled:pl-2',
                'sidebar-filled:pb-2',
                'sidebar-filled:page-no-toc:p-0',

                'bg-tint-base',
                'sidebar-filled:bg-tint-subtle',
                'theme-muted:bg-tint-subtle',
                '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',

                'before:hidden',
                'lg:before:block',
                'before:content-[""]',
                'before:absolute',
                'before:inset-x-0',
                'before:bottom-full',
                'before:h-8',
                'before:bg-gradient-to-b',
                'before:from-transparent',
                'before:to-tint-base',
                'sidebar-filled:before:to-tint-subtle',
                'theme-muted:before:to-tint-subtle',
                'theme-bold-tint:before:to-tint-subtle',
                '[html.sidebar-filled.theme-muted_&]:before:to-tint-base',
                '[html.sidebar-filled.theme-bold.tint_&]:before:to-tint-base',
                'page-no-toc:before:!to-transparent'
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
    space: Space;
    customization: SiteCustomizationSettings;
    placement: SiteInsightsTrademarkPlacement;
}) {
    const { space, customization, placement } = props;
    const language = getSpaceLanguage(customization);

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
                // 'page-no-toc:lg:max-xl:text-xs',
                // 'page-no-toc:lg:max-xl:px-3',
                // 'page-no-toc:lg:max-xl:py-3',
                'font-semibold',
                'text-tint',

                'flex',
                'flex-row',
                'items-center',
                'px-5',
                'py-4',

                'sidebar-filled:px-3',
                'sidebar-filled:page-no-toc:lg:px-5',

                'rounded-lg',
                'straight-corners:rounded-none',

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
                    // 'page-no-toc:lg:max-xl:size-4',
                    'shrink-0'
                )}
            />
            <span
                className={tcls(
                    'ml-3'
                    // 'page-no-toc:lg:max-xl:ml-2'
                )}
            >
                {t(language, 'powered_by_gitbook')}
            </span>
        </Link>
    );
}
