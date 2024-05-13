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
                'text-primary',
                'hover:text-primary-700',
                'transition-colors',
                style,
            )}
        >
            {props.children}
        </Link>
    );
}
