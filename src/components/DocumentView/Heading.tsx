import IconHash from '@geist-ui/icons/hash';
import { DocumentBlockHeading } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getBlockTextStyle } from './spacing';

export function Heading(props: BlockProps<DocumentBlockHeading>) {
    const { block, style, context, ...rest } = props;

    const textStyle = getBlockTextStyle(block);

    const Tag = TAGS[block.type];

    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;

    return (
        <Tag id={id} className={tcls(textStyle.textSize, 'group', 'relative', 'grid', style)}>
            <div
                className={tcls(
                    'grid',
                    'grid-area-1-1',
                    'relative',
                    '-ml-6',
                    'w-7',
                    'border-0',
                    'opacity-0',
                    'group-hover:opacity-[0]',
                    'group-focus:opacity-[0]',
                    'md:group-hover:md:opacity-[1]',
                    'md:group-focus:md:opacity-[1]',
                    textStyle.marginTop,
                )}
            >
                <a
                    href={`#${id}`}
                    aria-label="Direct link to heading"
                    className={tcls(
                        'inline-flex',
                        'h-full',
                        'items-start',
                        'dark:text-light/3',
                        'dark:shadow-none',
                        'dark:ring-0',
                        textStyle.lineHeight,
                    )}
                >
                    <IconHash
                        className={tcls(
                            'w-3.5',
                            'h-[1lh]',
                            'transition-colors',
                            'stroke-transparent',
                            'group-hover:stroke-dark/6',
                            'dark:group-hover:stroke-light/5',
                            'lg:w-4',
                        )}
                    />
                </a>
            </div>
            <div className={tcls('grid-area-1-1', 'z-[1]', textStyle.marginTop)}>
                <Inlines {...rest} context={context} nodes={block.nodes} />
            </div>
        </Tag>
    );
}

const TAGS: { [type in DocumentBlockHeading['type']]: React.ElementType } = {
    // The h1 is reserved for the page title
    'heading-1': 'h2',
    'heading-2': 'h3',
    'heading-3': 'h4',
};
