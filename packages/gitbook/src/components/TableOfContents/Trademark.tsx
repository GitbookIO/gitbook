import { CustomizationSettings, SiteCustomizationSettings, Space } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { t, getSpaceLanguage } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    return (
        <div
            className={tcls(
                'relative',
                'z-[2]',
                'lg:absolute',

                'left-0',
                'right-2',
                'pr-2',
                'bottom-0',

                'pointer-events-none',
                'sidebar-filled:pl-4',
                'sidebar-filled:pr-2',
                'sidebar-filled:pb-4',
                // 'lg:-left-5',
                // 'lg:right-2',
                // 'lg:pr-2',
                // 'lg:pb-4',
                
                // 'sidebar-filled:lg:pl-2',
                // 'sidebar-filled:pr-2',
                // 'sidebar-filled:pb-2',

                'bg-light',
                'sidebar-filled:bg-light-2',

                'before:content-[""]',
                'before:absolute',
                'before:inset-x-0',
                'before:bottom-full',
                'before:h-8',
                'before:bg-gradient-to-b',
                'before:from-transparent',
                'before:to-light',
                'sidebar-filled:before:to-light-2',
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
}) {
    const { space, customization } = props;
    const language = getSpaceLanguage(customization);

    const url = new URL('https://www.gitbook.com');
    url.searchParams.set('utm_source', 'content');
    url.searchParams.set('utm_medium', 'trademark');
    url.searchParams.set('utm_campaign', space.id);

    return (
        <a
            target="_blank"
            href={url.toString()}
            className={tcls(
                'text-sm',
                'font-semibold',
                'text-dark/8',

                'flex',
                'flex-row',
                'items-center',
                'px-4',
                'py-4',

                'rounded-lg',
                'straight-corners:rounded-none',

                'bg-light',
                'sidebar-filled:bg-light-2',
                'hover:bg-light-2',
                'dark:hover:bg-light/1',

                'ring-1',
                'lg:ring-0',
                'ring-inset',
                'ring-dark/2',
                'dark:ring-light/1',

                'border',
                'border-dark/2',
                'dark:border-light/2',

                'transition-colors',
                'pointer-events-auto',
            )}
        >
            <Icon icon="gitbook" className={tcls('size-5', 'mr-3')} />
            {t(language, 'powered_by_gitbook')}
        </a>
    );
}
