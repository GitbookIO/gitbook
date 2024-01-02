import NextLink, { LinkProps } from 'next/link';

import { tcls } from '@/lib/tailwind';

/**
 * Styled version of Next.js Link component.
 */
export function Link(props: LinkProps & { children: React.ReactNode }) {
    return (
        <NextLink
            {...props}
            className={tcls(
                'underline',
                'underline-offset-2',
                'text-primary',
                'hover:text-primary-700',
                'transition-colors',
            )}
        >
            {props.children}
        </NextLink>
    );
}
