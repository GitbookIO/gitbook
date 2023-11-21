import { IntlContext, t } from '@/lib/intl';
import { tcls } from '@/lib/tailwind';

/**
 * Link to the GitBook platform.
 */
export function Trademark(props: IntlContext) {
    return (
        <div className={tcls('absolute', 'bottom-0', 'right-0', 'left-0', 'flex', 'flex-col')}>
            <a
                href="https://www.gitbook.com"
                className={tcls(
                    'text-m',
                    'text-dark/8',
                    'font-normal',
                    'px-4',
                    'py-3',
                    'mr-4',
                    'my-4',
                    'rounded-lg',
                    'bg-dark/1',
                    'hover:bg-dark/2',
                    'transition-colors',
                    'dark:bg-vanta/5',
                    'dark:text-light/5',
                    'dark:hover:bg-vanta/6',
                )}
            >
                {t(props, 'powered_by_gitbook')}
            </a>
        </div>
    );
}
