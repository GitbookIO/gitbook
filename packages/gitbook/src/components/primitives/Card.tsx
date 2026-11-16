import { Icon } from '@gitbook/icons';

import { Link, type LinkInsightsProps, type LinkProps } from './Link';
import { type ClassValue, cx } from '@/lib/classnames';

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
            className={cx(style)}
            classNames={['CardStyles']}
            insights={insights}
            {...rest}
        >
            {leadingIcon}
            <span className="card-body">
                {preTitle ? <span className="card-pretitle">{preTitle}</span> : null}

                <span className="card-title">{title}</span>

                {postTitle ? <span className="card-posttitle">{postTitle}</span> : null}
            </span>
            <Icon icon="chevron-right" className="card-chevron" />
        </Link>
    );
}
