import { ClassValue, tcls } from '@/lib/tailwind';

import { Link, LinkProps } from '../primitives/Link';

/**
 * Styled version of Link component.
 */
export function StyledLink(props: Omit<LinkProps, 'style'> & { style?: ClassValue }) {
    const { style, ...rest } = props;

    return (
        <Link
            {...rest}
            className={tcls(
                'underline',
                'decoration-from-font',
                'underline-offset-2',
                'links-underline:underline-offset-4',

                'links-color:decoration-primary/6',
                'links-color:text-primary-subtle',
                'links-color:hover:text-primary',
                'links-color:contrast-more:text-primary',
                'links-color:contrast-more:hover:text-primary-strong',

                'links-underline:decoration-primary-subtle',
                'links-underline:hover:decoration-[3px]',
                'links-underline:hover:[text-decoration-skip-ink:none]',

                'transition-all',
                'duration-100',
                style,
            )}
        >
            {props.children}
        </Link>
    );
}
