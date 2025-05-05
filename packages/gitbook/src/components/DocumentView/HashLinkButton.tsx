import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentBlockHeading, DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { getBlockTextStyle } from './spacing';

/**
 * A hash icon which adds the block or active block item's ID in the URL hash.
 */
export function HashLinkButton(props: {
    id: string;
    block: DocumentBlockTabs | DocumentBlockHeading;
    label?: string;
    className?: ClassValue;
}) {
    const { id, block, className, label = 'Direct link to block' } = props;
    const textStyle = getBlockTextStyle(block);
    return (
        <div
            className={tcls(
                'hash',
                'grid',
                'grid-area-1-1',
                // 'absolute',
                // 'left-0',
                // 'top-1',
                'w-7',
                'border-0',
                'opacity-0',
                'group-hover:opacity-[0]',
                'group-focus:opacity-[0]',
                'md:group-hover:md:opacity-[1]',
                'md:group-focus:md:opacity-[1]',
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
                        'size-4',
                        'transition-colors',
                        'text-transparent',
                        'group-hover:text-tint-subtle',
                        'contrast-more:group-hover:text-tint-strong'
                    )}
                />
            </a>
        </div>
    );
}
