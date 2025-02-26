import { type ClassValue, tcls } from '@/lib/tailwind';

import { Link, type LinkProps } from '../primitives/Link';

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
                'links-accent:underline-offset-4',

                'links-default:decoration-primary/6',
                'links-default:text-primary-subtle',
                'links-default:hover:text-primary',
                'links-default:contrast-more:text-primary',
                'links-default:contrast-more:hover:text-primary-strong',

                'links-accent:decoration-primary-subtle',
                'links-accent:hover:decoration-[3px]',
                'links-accent:hover:[text-decoration-skip-ink:none]',

                'transition-all',
                'duration-100',
                style
            )}
        >
            {props.children}
        </Link>
    );
}
