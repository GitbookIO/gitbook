import { tcls } from '@/lib/tailwind';

/**
 * Link to the GitBook platform.
 */
export function Trademark() {
    return (
        <div className={tcls('absolute', 'bottom-0', 'right-0', 'left-0', 'flex', 'flex-col')}>
            <a
                href="https://www.gitbook.com"
                className={tcls(
                    'text-m',
                    'text-slate-500',
                    'font-normal',
                    'px-4',
                    'py-3',
                    'mx-4',
                    'my-4',
                    'rounded-lg',
                    'bg-white',
                    'hover:bg-slate-50',
                )}
            >
                Powered by GitBook
            </a>
        </div>
    );
}
