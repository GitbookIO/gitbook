import {
    CustomizationSettings,
    SiteCustomizationSettings,
    Space,
    SiteInsightsTrademarkPlacement,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { t, getSpaceLanguage } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
    placement: SiteInsightsTrademarkPlacement;
}) {
    return (
        <div
            className={tcls(
                'relative',
                'z-[2]',
                'lg:absolute',
                'mt-6',

                'left-0',
                'right-2',
                'bottom-0',

                'pointer-events-none',
                'sidebar-filled:pl-2',
                'sidebar-filled:pb-2',

                'bg-light',
                'sidebar-filled:bg-light-2',
                '[html.tint.sidebar-filled_&]:bg-light-1',

                'dark:bg-dark',
                'dark:sidebar-filled:bg-dark-1',
                'dark:[html.tint.sidebar-filled_&]:bg-dark-1',

                'before:hidden',
                'lg:before:block',
                'before:content-[""]',
                'before:absolute',
                'before:inset-x-0',
                'before:bottom-full',
                'before:h-8',
                'before:bg-gradient-to-b',
                'before:from-transparent',
                'before:to-light',
                'sidebar-filled:before:to-light-2',
                '[html.tint.sidebar-filled_&]:before:to-light-1',
                'dark:before:to-dark',
                'dark:sidebar-filled:before:to-dark-1',
                'dark:[html.tint.sidebar-filled_&]:before:to-dark-1',
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
    customization: CustomizationSettings | SiteCustomizationSettings;
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
                'font-semibold',
                'text-dark/8',
                'dark:text-light/8',

                'flex',
                'flex-row',
                'items-center',
                'px-5',
                'py-4',
                'sidebar-filled:px-3',

                'rounded-lg',
                'straight-corners:rounded-none',

                'hover:bg-dark/1',
                'dark:hover:bg-light/1',

                'ring-2',
                'lg:ring-1',
                'ring-inset',
                'ring-dark/2',
                'dark:ring-light/1',

                'transition-colors',
                'pointer-events-auto',
            )}
            insights={{
                type: 'trademark_click',
                placement,
            }}
        >
            <Icon icon="gitbook" className={tcls('size-5', 'mr-3')} />
            {t(language, 'powered_by_gitbook')}
        </Link>
    );
}
