import { IntlContext, t } from '@/lib/intl';
import { tcls } from '@/lib/tailwind';

import { IconLogo } from '../icons/IconLogo';
/**
 * Link to the GitBook platform.
 */
export function Trademark(props: IntlContext) {
    return (
        <div
            className={tcls(
                'relative',
                'lg:absolute',
                'bottom-0',
                'right-0',
                'left-0',
                'flex',
                'flex-col',
                'pointer-events-none',
            )}
        >
            <div
                className={tcls(
                    'text-sm',
                    'text-dark/8',
                    'pr-2',
                    'pt-2',
                    'pb-2',
                    'mt-0',
                    'mb-4',
                    'bg-[size:250%_125%]',
                    'bg-[position:50%_35%]',
                    'bg-[radial-gradient(farthest-side_at_50%_-70%,_var(--tw-gradient-stops))] from-transparent from-60% to-light to-80%',
                    'lg:mr-4',
                    'lg:mb-0',
                    'lg:mr-2',
                    'lg:pt-16',
                    'dark:text-light/6',
                    'dark:dark:to-dark',
                )}
            >
                <a
                    href="https://www.gitbook.com"
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
                        'px-2',
                        'py-2',
                        'rounded-md',
                        'hover:backdrop-blur-sm',
                        'lg:ring-0',
                        'dark:hover:bg-light/1',
                        'dark:ring-light/1',
                        'dark:font-normal',
                    )}
                >
                    <IconLogo className={tcls('w-5', 'h-5', 'mr-3')} />
                    {t(props, 'powered_by_gitbook')}
                </a>
            </div>
        </div>
    );
}
