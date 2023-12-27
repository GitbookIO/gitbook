import { CustomizationSettings, Space } from '@gitbook/api';

import { t, getSpaceLanguage } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import { IconLogo } from '../icons/IconLogo';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: { space: Space; customization: CustomizationSettings }) {
    return (
        <div
            className={tcls(
                'relative',
                'z-[2]',
                'lg:absolute',
                'bottom-0',
                'right-0',
                'left-0',
                'flex',
                'flex-col',
                'pointer-events-none',
                'lg:-left-5',
            )}
        >
            <div
                className={tcls(
                    'text-sm',
                    'text-dark/8',
                    'pr-0',
                    'pt-2',
                    'pb-2',
                    'mt-4',
                    'mb-4',
                    'bg-[size:250%_125%]',
                    'bg-[position:50%_35%]',
                    'bg-[radial-gradient(farthest-side_at_50%_-70%,_var(--tw-gradient-stops))] from-transparent from-60% to-light to-80%',
                    'lg:pr-2',
                    'lg:mt-0',
                    'lg:mb-0',
                    'lg:mr-2',
                    'lg:pt-16',
                    'dark:text-light/6',
                    'dark:dark:to-dark',
                )}
            >
                <TrademarkLink {...props} />
            </div>
        </div>
    );
}

/**
 * Trademark link to the GitBook.
 */
export function TrademarkLink(props: { space: Space; customization: CustomizationSettings }) {
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
                'font-semibold',
                'ring-1',
                'ring-inset',
                'ring-dark/2',
                'pointer-events-auto',
                'transition-colors',
                'flex',
                'flex-row',
                'items-center',
                'hover:bg-dark/1',
                'px-4',
                'py-2',
                'rounded-md',
                'hover:backdrop-blur-sm',
                'lg:ring-0',
                'tracking-[-0.016em]',
                'dark:hover:bg-light/1',
                'dark:ring-light/1',
                'dark:font-normal',
            )}
        >
            <IconLogo className={tcls('w-5', 'h-5', 'mr-3')} />
            {t(language, 'powered_by_gitbook')}
        </a>
    );
}
