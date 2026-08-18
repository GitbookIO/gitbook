import { Link, type LinkProps } from '../primitives/Link';
import type { DesignTokenName } from './StyleProvider';
import type { ClassValue } from '@/lib/tailwind';

/**
 * Styled version of Link component.
 */
export function StyledLink(props: Omit<LinkProps, 'style'> & { className?: ClassValue }) {
    const { classNames, ...rest } = props;

    const classNamesToForward: DesignTokenName[] = [...(classNames || []), 'LinkStyles'];

    return (
        <Link {...rest} classNames={classNamesToForward}>
            {props.children}
        </Link>
    );
}
