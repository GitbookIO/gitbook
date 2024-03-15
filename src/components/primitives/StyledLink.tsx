import { tcls } from '@/lib/tailwind';

import { Link, LinkProps } from '../primitives/Link';

/**
 * Styled version of Link component.
 */
export function StyledLink(props: LinkProps) {
    return (
        <Link
            {...props}
            className={tcls(
                'underline',
                'underline-offset-2',
                'decoration-primary/6',
                'text-primary',
                'hover:text-primary-700',
                'transition-colors',
            )}
        >
            {props.children}
        </Link>
    );
}
