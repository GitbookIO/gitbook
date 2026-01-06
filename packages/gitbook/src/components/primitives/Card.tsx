import { Icon } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Link, type LinkInsightsProps, type LinkProps } from './Link';

export type CardProps = {
    href: string;
    leadingIcon?: React.ReactNode;
    preTitle?: string;
    title: string;
    postTitle?: string;
    style?: ClassValue;
} & LinkInsightsProps &
    Omit<LinkProps, 'href' | 'className' | 'classNames' | 'insights' | 'style'>;

export function Card(
    props: {
        href: string;
        leadingIcon?: React.ReactNode;
        preTitle?: string;
        title: string;
        postTitle?: string;
        style?: ClassValue;
    } & LinkInsightsProps &
        Omit<LinkProps, 'href' | 'className' | 'classNames' | 'insights' | 'style'>
) {
    const { ref, title, leadingIcon, href, preTitle, postTitle, style, insights, ...rest } = props;

    return (
        <Link
            ref={ref}
            href={href}
            className={tcls(style)}
            classNames={['CardStyles']}
            insights={insights}
            {...rest}
        >
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
