import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentBlockHeading, DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { getBlockTextStyle } from './spacing';

/**
 * A hash icon which adds the block or active block item's ID in the URL hash.
 * The button needs to be wrapped in a container with `hashLinkButtonWrapperStyles`.
 */
export const hashLinkButtonWrapperStyles = tcls('relative', 'group/hash');

export function HashLinkButton(props: {
    id: string;
    block: DocumentBlockTabs | DocumentBlockHeading;
    label?: string;
    className?: ClassValue;
    iconClassName?: ClassValue;
}) {
    const { id, block, className, iconClassName, label = 'Direct link to block' } = props;
    const textStyle = getBlockTextStyle(block);
    return (
        <div
            className={tcls(
                'relative',
                'hash',
                'grid',
                'grid-area-1-1',
                'h-[1em]',
                'border-0',
                'opacity-0',
                'group-hover/hash:opacity-[0]',
                'group-focus/hash:opacity-[0]',
                'md:group-hover/hash:opacity-[1]',
                'md:group-focus/hash:opacity-[1]',
                className
            )}
        >
            <a
                href={`#${id}`}
                aria-label={label}
                className={tcls('inline-flex', 'h-full', 'items-start', textStyle.lineHeight)}
            >
                <Icon
                    icon="hashtag"
                    className={tcls(
                        'size-3',
                        'self-center',
                        'transition-colors',
                        'text-transparent',
                        'group-hover/hash:text-tint-subtle',
                        'contrast-more:group-hover/hash:text-tint-strong',
                        iconClassName
                    )}
                />
            </a>
        </div>
    );
}
