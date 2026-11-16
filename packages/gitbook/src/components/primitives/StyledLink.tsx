import { Link, type LinkProps } from '../primitives/Link';
import type { DesignTokenName } from './StyleProvider';
import { type ClassValue, cx } from '@/lib/classnames';

/**
 * Styled version of Link component.
 */
export function StyledLink(
    props: Omit<LinkProps, 'style' | 'className'> & { className?: ClassValue }
) {
    const { classNames, className, ...rest } = props;

    const classNamesToForward: DesignTokenName[] = [...(classNames || []), 'LinkStyles'];

    return (
        <Link {...rest} className={cx(className)} classNames={classNamesToForward}>
            {props.children}
        </Link>
    );
}
