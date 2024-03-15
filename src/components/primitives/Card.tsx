import ChevronRight from '@geist-ui/icons/chevronRight';

import { ClassValue, tcls } from '@/lib/tailwind';

import { Link } from './Link';

export async function Card(props: {
    href: string;
    leadingIcon?: React.ReactNode;
    preTitle?: string;
    title: string;
    postTitle?: string;
    style?: ClassValue;
}) {
    const { title, leadingIcon, href, preTitle, postTitle, style } = props;

    return (
        <Link
            href={href}
            className={tcls(
                'group',
                'flex',
                'flex-row',
                'justify-between',
                'items-center',
                'gap-0.5',
                'ring-1',
                'ring-dark/3',
                'rounded',
                'straight-corners:rounded-none',
                'px-5',
                'py-3',
                'transition-shadow',
                'hover:ring-primary/6',
                'hover:ring-primary/8',
                'dark:ring-light/2',
                'dark:hover:text-light',
                'dark:hover:ring-primary-300/4',
                style,
            )}
        >
            {leadingIcon ? <span className={tcls('mr-4')}>{leadingIcon}</span> : null}
            <span className={tcls('flex', 'flex-col', 'flex-1')}>
                {preTitle ? (
                    <span
                        className={tcls('uppercase', 'text-xs', 'text-dark/7', 'dark:text-light/6')}
                    >
                        {preTitle}
                    </span>
                ) : null}

                <span
                    className={tcls('text-base', 'transition-colors', 'group-hover:text-primary')}
                >
                    {title}
                </span>

                {postTitle ? (
                    <span className={tcls('text-xs', 'text-dark/7', 'dark:text-light/6')}>
                        {postTitle}
                    </span>
                ) : null}
            </span>
            <ChevronRight
                className={tcls(
                    'w-4',
                    'h-4',
                    'stroke-dark/7',
                    'transition-all',
                    'group-hover:translate-x-0.5',
                    'group-hover:stroke-primary/8',
                    'dark:stroke-light/6',
                )}
            />
        </Link>
    );
}
