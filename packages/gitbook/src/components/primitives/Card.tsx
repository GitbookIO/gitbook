import { Icon } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Link, type LinkInsightsProps } from './Link';

export async function Card(
    props: {
        href: string;
        leadingIcon?: React.ReactNode;
        preTitle?: string;
        title: string;
        postTitle?: string;
        style?: ClassValue;
    } & LinkInsightsProps
) {
    const { title, leadingIcon, href, preTitle, postTitle, style, insights } = props;

    return (
        <Link href={href} className={tcls(style)} classNames={['CardStyles']} insights={insights}>
            {leadingIcon}
            <span className={tcls('flex', 'flex-col', 'flex-1')}>
                {preTitle ? (
                    <span className={tcls('uppercase', 'text-xs', 'text-tint')}>{preTitle}</span>
                ) : null}

                <span
                    className={tcls('text-base', 'transition-colors', 'group-hover:text-primary')}
                >
                    {title}
                </span>

                {postTitle ? (
                    <span className={tcls('text-xs', 'text-tint')}>{postTitle}</span>
                ) : null}
            </span>
            <Icon
                icon="chevron-right"
                className={tcls(
                    'size-3',
                    'text-tint',
                    'transition-all',
                    'group-hover:translate-x-0.5',
                    'group-hover:text-primary'
                )}
            />
        </Link>
    );
}
