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
                'underline-offset-2',
                'decoration-primary/6',
                'text-primary-subtle',
                'hover:text-primary',
                'contrast-more:text-primary',
                'contrast-more:hover:text-primary-strong',
                'transition-colors',
                style,
            )}
        >
            {props.children}
        </Link>
    );
}
