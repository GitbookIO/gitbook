import IconHash from '@geist-ui/icons/hash';
import { DocumentBlockHeading } from '@gitbook/api';

import { pageLocalId } from '@/lib/links';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getBlockTextStyle } from './spacing';

export function Heading(props: BlockProps<DocumentBlockHeading>) {
    const { block, style, context, ...rest } = props;

    const textStyle = getBlockTextStyle(block);
    const Tag = TAGS[block.type];

    const id = pageLocalId(context.page, block.meta?.id ?? '', context);

    return (
        <Tag id={id} className={tcls(textStyle.textSize, 'group', 'relative', style)}>
            <div
                className={tcls(
                    'absolute',
                    '-left-7',
                    'ml-full',
                    'w-7',
                    'hidden',
                    'items-center',
                    'border-0',
                    'opacity-0',
                    'group-hover:opacity-100',
                    'group-focus:opacity-100',
                    'lg:flex',
                    textStyle.lineHeight,
                )}
            >
                <a
                    href={`#${id}`}
                    aria-label="Direct link to heading"
                    className={tcls(
                        'flex',
                        'h-6',
                        'w-6',
                        'items-center',
                        'justify-center',
                        'transition-colors',
                        'dark:text-light/3',
                        'dark:shadow-none',
                        'dark:ring-0',
                    )}
                >
                    <IconHash
                        className={tcls(
                            'w-4',
                            'h-4',
                            'stroke-dark/5',
                            'group-hover:stroke-dark/6',
                            'dark:stroke-light/2',
                            'dark:group-hover:stroke-light/4',
                        )}
                    />
                </a>
            </div>

            <Inlines {...rest} context={context} nodes={block.nodes} />
        </Tag>
    );
}

const TAGS: { [type in DocumentBlockHeading['type']]: React.ElementType } = {
    // The h1 is reserved for the page title
    'heading-1': 'h2',
    'heading-2': 'h3',
    'heading-3': 'h4',
};
