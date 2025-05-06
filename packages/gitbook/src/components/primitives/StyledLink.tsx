import { type ClassValue, tcls } from '@/lib/tailwind';

import { Link, type LinkProps } from '../primitives/Link';

export const linkStyles = [
    'underline',
    'decoration-[max(0.07em,1px)]', // Set the underline to be proportional to the font size, with a minimum. The default is too thin.
    'underline-offset-2',
    'links-accent:underline-offset-4',

    'links-default:decoration-primary/6',
    'links-default:text-primary-subtle',
    'hover:links-default:text-primary-strong',
    'contrast-more:links-default:text-primary',
    'contrast-more:hover:links-default:text-primary-strong',

    'links-accent:decoration-primary-subtle',
    'hover:links-accent:decoration-[3px]',
    'hover:links-accent:[text-decoration-skip-ink:none]',

    'transition-all',
    'duration-100',
];

/**
 * Styled version of Link component.
 */
export function StyledLink(props: Omit<LinkProps, 'style'> & { className?: ClassValue }) {
    const { className, ...rest } = props;

    return (
        <Link {...rest} className={tcls(linkStyles, className)}>
            {props.children}
        </Link>
    );
}
